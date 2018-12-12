pm.test(request.name, () => {
    const jwtUtils = eval(pm.globals.get('jwtUtils'));

    let jwtToken;
    try {
        jwtToken = jwtUtils.generateJwtToken(JSON.parse(data.data), data.alg, data.secret);
    } catch(e) {
        if (data.positive) {
            pm.expect(true).to.equal(false, `GWT token generation has failed in positive test (${data.desc}): ${e}.`);
        } else {
            pm.expect(e).to.equal(data.result);
        }
    }
    
    if (data.positive) {
        pm.expect(jwtToken).to.equal(data.result);
    } else if (jwtToken) {
        pm.expect(true).to.equal(false, `JWT token was generated in negative test (${data.desc}).`);
    }
});