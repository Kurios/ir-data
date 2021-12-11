import TailFile from '@logdna/tail-file'

//'%LocalAppData%/lagrange_global_online_branch/log.txt'
const tail = new TailFile('C:\\Users\\jmorg\\AppData\\Local\\lagrange_global_online_branch\\log.txt', {encoding: 'utf8'})
  .on('data', (chunk) => {

    let d = chunk.split("\n");
    if(/cmd_id:\[502\]/g.test(d[1]) ){
        console.log("match")
        //console.log(d[2])
        console.log(d[2].substring(26))
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
