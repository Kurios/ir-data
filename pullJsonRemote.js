import TailFile from '@logdna/tail-file'
import http from 'http'

let lastRead = 0;

//'%LocalAppData%/lagrange_global_online_branch/log.txt'
console.log("listening to " + process.env.localappdata +'\\lagrange_global_online_branch\\log.txt');
const tail = new TailFile(process.env.localappdata +'/lagrange_global_online_branch/log.txt', { encoding: 'utf8' })
  .on('data', (chunk) => {

    let d = chunk.split("\n");
    if (/cmd_id:\[502\]/g.test(d[1])) {
      console.log("match")
      //console.log(d[2])
      let payload = JSON.parse(d[2].substring(26));
      console.log("payload aquired!")
      console.log(JSON.stringify(payload))

      //only once every 5 minutes....
      
      if((new Date().getTime() - lastRead ) > 300000){
        console.log("transfering");
        lastRead = new Date().getTime();
        const options = { hostname:"notthedomainyourlookingfor.com", port:80, path: "/write", method: "POST"}
        const request = http.request(options, (response) => {});
        request.write(JSON.stringify(payload));
        request.end();
        console.log("finished");
      }
      

    }
    //console.log("START SEGMENT: \n " + chunk)
    //console.log(`Recieved a utf8 character chunk: ${chunk}`)
  })
  .on('tail_error', (err) => {
    console.error('TailFile had an error!', err)
  })
  .on('error', (err) => {
    console.error('A TailFile stream error was likely encountered', err)
  })
  .start()
  .catch((err) => {
    console.error('Cannot start.  Does the file exist?', err)
  })
