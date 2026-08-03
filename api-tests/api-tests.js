import http from 'k6/http';

export let options = {
    insecureSkipTLSVerify: true,
    noConnectionReuse: false,
    vus: 10,    // store number of virtual users testing the system simultaneously
    duration: '20s'
};

// Default test case
export default() => {
    const url = 'http://localhost:6010/overload';
    http.get(url);
};



