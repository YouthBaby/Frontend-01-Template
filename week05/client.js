const net = require('net');
const { parseHTML } = require('../week06/parser');

class Request {
  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.path = options.path || '/';
    this.port = options.port || 80;
    this.body = options.body || {};
    this.headers = options.headers || {};
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(
        key => `${key}=${encodeURIComponent(this.body[key])}`
      ).join('&');
    }
    this.headers['Content-Length'] = this.bodyText.length;
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}`
  }

  send(connection) {
    return new Promise((resove, reject) => {
      const parser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port
        }, () => {
          console.log('connect to server');
          connection.write(this.toString());
        })
      }

      connection.on('data', (data) => {
        parser.recive(data.toString());
        if (parser.isFinished) {
          resove(parser.response);
        }
        connection.end();
      })

      connection.on('end', (err) => {
        reject(err);
        connection.end();
      });

    })
  }
}

class ResponseParser {
  constructor() {
    this.WATING_STATUS_LINE = 0;
    this.WATING_STATUS_LINE_END = 1;
    this.WATING_HEADER_NAME = 2;
    this.WATING_HEADER_SPACE = 3;
    this.WATING_HEADER_VALUE = 4;
    this.WATING_HEADER_LINE_END = 5;
    this.WATING_HEADER_BLOCK_END = 6;
    this.WATING_BODY = 7;
    this.current = this.WATING_STATUS_LINE;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';
    this.bodyParser = null;
  }
  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }
  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    }
  }
  recive(string) {
    for (let i = 0; i < string.length; i++) {
      this.reciveChar(string.charAt(i));
    }
  }
  reciveChar(char) {
    if (this.current === this.WATING_STATUS_LINE) {
      if (char === '\r') {
        this.current = this.WATING_STATUS_LINE_END;
      } else {
        this.statusLine += char;
      }
    } else if (this.current === this.WATING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WATING_HEADER_NAME;
      }
    } else if (this.current === this.WATING_HEADER_NAME) {
      if (char === ':') {
        this.current = this.WATING_HEADER_SPACE;
      } else if (char === '\r') {
        this.current = this.WATING_HEADER_BLOCK_END;
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkedBodyParser();
        }
      } else {
        this.headerName += char;
      }
    } else if (this.current === this.WATING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WATING_HEADER_VALUE;
      }
    } else if (this.current === this.WATING_HEADER_VALUE) {
      if (char === '\r') {
        this.current = this.WATING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = '';
        this.headerValue = '';
      } else {
        this.headerValue += char;
      }
    } else if (this.current === this.WATING_HEADER_LINE_END) {
      if (char === '\n') {
        this.current = this.WATING_HEADER_NAME;
      }
    } else if (this.current === this.WATING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WATING_BODY
      }
    } else if (this.current === this.WATING_BODY) {
      this.bodyParser.reciveChar(char);
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    this.WATING_LENGTH = 0;
    this.WATING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WATING_NEW_LINE = 3;
    this.WATING_NEW_LINE_END = 4;
    this.length = 0;
    this.isFinished = false;
    this.content = [];
    this.current = this.WATING_LENGTH;
  }
  reciveChar(char) {
    if (this.current === this.WATING_LENGTH) {
      if (char === '\r') {
        if (this.length === 0) {
          this.isFinished = true;
        }
        this.current = this.WATING_LENGTH_LINE_END;
      } else {
        this.length *= 16;
        this.length += parseInt(char, 16);
      }
    } else if (this.current === this.WATING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.current = this.READING_TRUNK;
      }
    } else if (this.current === this.READING_TRUNK) {
      this.content.push(char);
      if (--this.length === 0) {
        this.current = this.WATING_NEW_LINE;
      }
    } else if (this.current === this.WATING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WATING_NEW_LINE_END;
      }
    } else if (this.current === this.WATING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WATING_LENGTH;
      }
    }
  }
}

void async function() {
  const request = new Request({
    host: '127.0.0.1',
    port: 8088,
    path: '/',
    method: 'POST',
    body: {
      name: 'winter'
    }
  })

  let response = await request.send();
  console.log(parseHTML(response.body));
}()
