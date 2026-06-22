const { exec } = require('child_process');

// Run next dev
const next = exec('npm run dev');
next.stdout.on('data', data => console.log('NEXT:', data));
next.stderr.on('data', data => console.error('NEXT ERR:', data));

setTimeout(() => {
  next.kill();
  process.exit();
}, 15000);
