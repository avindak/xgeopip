const geoip = require('../geoip/xgeoip');
const assert = require('assert');

async function test_country(ip, code){    
    await geoip.load_memory();
    const res = await geoip.resolve(ip);
    res.ip = ip;
    console.log(res);
    assert.equal(res.country_code, code);
}

async function run(){
    //AU IP
    await test_country("1.1.1.1","AU");
    //IL IP
    await test_country("84.108.14.154","IL");
    //US IP
    await test_country("34.44.12.234","US");
    //Private ip
    await test_country("192.168.1.1","");

    console.time('test');

    let tip = "";
    for(var i=0;i<10000;i++){
        tip =`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        await geoip.resolve(tip);
    }
    

    console.timeEnd('test');
    
}

run();