const fs = require('fs');
var AdmZip = require('adm-zip');
const IpInfo = require('./ipinfo').IpInfo;
const Utilx = require('./utillx').Utilx;
var sqlite3 = require('sqlite3').verbose();
const util = require('util');
const path = require("path");

class GeoIp{

    constructor(data_file=null, verbose=false){
        this.verbose = verbose;
        this.conn = new sqlite3.Database(':memory:');
        this.conn.arun = util.promisify(this.conn.run);
        this.conn.aget = util.promisify(this.conn.get);
        this.conn.aall = util.promisify(this.conn.all);
        this.conn.aexec = util.promisify(this.conn.exec);
        if (data_file == null){
            this.data_file = path.resolve(__dirname,'./ip2nation.zip');
        }
        else{
            this.data_file = data_file;
        }
        this.printv(`Data file : ${this.data_file}`);
        this.loaded = false;        
    }

    printv(s){
        if (this.verbose){
            console.log(s);
        }
    }

    async load_memory(){
        if(this.loaded){
            return;
        }
        this.loaded = false;
        this.printv("Load memory started...");
        if (fs.existsSync(this.data_file) == false) {
            console.warn( "WARNING: The data file does not exists. Call download() to Download it.");
            return;
        }
            const buf = fs.readFileSync(this.data_file);
            const zip = new AdmZip(buf);
            const zipEntries = zip.getEntries();
            const entry = zipEntries[0];
            this.printv(`File found in Zip : ${entry.entryName}`);
            let data = zip.readAsText(entry);           
            let c = this.conn;
            await c.aexec(`
                        PRAGMA foreign_keys=OFF;
                        BEGIN TRANSACTION;
                        DROP TABLE IF EXISTS ip2nation;

                        CREATE TABLE ip2nation (
                          ip int(11),
                          country char(2) NOT NULL default ''
                        );

                        DROP INDEX IF EXISTS ip_indx;

                        CREATE INDEX ip_indx ON ip2nation(ip);

                        DROP TABLE IF EXISTS ip2nationCountries;

                        CREATE TABLE ip2nationCountries (
                          code varchar(4) PRIMARY KEY,
                          iso_code_2 varchar(2) NOT NULL default '',
                          iso_code_3 varchar(3) default '',
                          iso_country varchar(255) NOT NULL default '',
                          country varchar(255) NOT NULL default '',
                          lat float NOT NULL default '0',
                          lon float NOT NULL default '0'
                        );

                        COMMIT;

                        `);

            let counter = 0;
            let script = "";
            const lines = data.split("\n");
            script += "PRAGMA foreign_keys=OFF;";
            script += "BEGIN TRANSACTION;";

            for (let i=0;i<lines.length;i++){
                const raw_line = lines[i];
                if (raw_line.startsWith("INSERT")){
                    const line = raw_line.replace(/\\'/g, "");
                    script += line;
                    counter += 1;
                }
            }
            script += "COMMIT;";
            await c.aexec(script);


        this.printv(`Load memory completed with ${counter}`);
        this.loaded = true;
    }

    async resolve2(ip_str){
        const ipinfox = await this.resolve(ip_str);
        return ipinfox == null ? null : ipinfox.country_code;
    }


    async resolve(ip_str, auto_load=true, resolve_host_name=false){
        if (!this.loaded){
            if (auto_load){
                await this.load_memory();
            }
            else{
                console.warn("WARNING : Ip data should be loaded before calling resolve");
            }

            if (!this.loaded){
                return null;
            }
        }
        const ip = Utilx.ip2inet(ip_str);
        let query = `
         SELECT c.iso_code_2, c.country FROM
         ip2nationCountries c,
         ip2nation i
	        WHERE
	            i.ip < ${ip}
	            AND
	            c.code = i.country
	        ORDER BY
	            i.ip DESC
            LIMIT 0,1;`
            
        
        let c  = this.conn;
        const res = await c.aget(query);
        const country_code = res == null ? ""  : res.iso_code_2;
        const country = res == null ? ""  : res.country;
        const host_name = ""

        if (resolve_host_name){
            //host_name = Utilx.get_host(ip_str);
        }

        const info = new IpInfo(country_code, country, host_name);
        return info;
    }

}

async function resolve(ip, verbose){
    const ipr = new GeoIp();
    ipr.verbose = verbose;
    await ipr.load_memory();
    const res = await ipr.resolve(ip);
    res.ip = ip;
    console.log(res);
}
async function resolve2(ip, verbose){
    const ipr = new GeoIp();
    ipr.verbose = verbose;
    await ipr.load_memory();
    const res = await ipr.resolve2(ip);
    console.log(res);
}

var args = process.argv.slice(2);
let cmd = args[0];
switch(cmd){
    case "resolve":
        resolve(args[1], false);
        break;
    case "resolves":
        resolve2(args[1], false);
        break;
}

module.exports = new GeoIp();


