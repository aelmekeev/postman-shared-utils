pm.globals.set('jwtUtils', function loadJwtUtils() {
    let utils = {};

    utils.generateJwtToken = (data, algorithm, ...algorithmParams) => {
        const header = {
          'alg': algorithm,
          'typ': 'JWT'
        };
        
        const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
        const encodedHeader = base64UrlEncode(stringifiedHeader);
        
        const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
        const encodedData = base64UrlEncode(stringifiedData);
        
        const token = `${encodedHeader}.${encodedData}`;
        
        return signToken(token, algorithm, algorithmParams);
    }

    /**
     * CryptoJS doesn not support RSA - https://github.com/brix/crypto-js/issues/170.
     * CryptoJS doesn not support ECDSA.
     */
    const ENCODERS = {
        'HS256': CryptoJS.HmacSHA256,
        'HS384': CryptoJS.HmacSHA384,
        'HS512': CryptoJS.HmacSHA512
    };

    function base64UrlEncode(source) {
        // Encode in classical base64
        encodedSource = CryptoJS.enc.Base64.stringify(source);
        
        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');
        
        // Replace characters according to base64UrlEncode specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');
        
        return encodedSource;
    }

    function signToken(token, algorithm, algorithmParams) {
        const encode = ENCODERS[algorithm];
        
        let signature;
        if (encode) {
            if (['HS256', 'HS384', 'HS512'].includes(algorithm)) {
                signature = encode(token, algorithmParams[0]);
            } else {
                throw `Not able to pass parameters to algorithm ${algorithm}`;
            }
        } else {
            throw `Not able to sign token with ${algorithm}`;
        }
        
        const encodedSignature = base64UrlEncode(signature);
        
        return `${token}.${encodedSignature}`;
    }
    
    return utils;
} + '; loadJwtUtils();');