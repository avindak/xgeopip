class Utilx{

    static ip2inet(ip){
        let original_ip = ip;
        try{
            // 42.60.159.15, 220.255.2.170
            if (ip.includes(",")){
                const proxy_tokens = ip.split(',');
                if (proxy_tokens[len(proxy_tokens) - 1].includes(".")){
                    ip = proxy_tokens[len(proxy_tokens) - 1];
                }
                else{
                    ip = proxy_tokens[len(proxy_tokens) - 2];
                }
            }
            const tokens = ip.split('.');
            const inet = parseInt(tokens[0]) * 16777216 + parseInt(tokens[1]) * 65536 + parseInt(tokens[2]) * 256 + parseInt(tokens[3]);
            return inet
        }
        catch(e){
            console.error(e);
            console.error( `Error in ip2inet for ip: ${original_ip}`);
            return 0
        }
    }

}

module.exports.Utilx = Utilx;