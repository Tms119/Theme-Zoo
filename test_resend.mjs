import 'dotenv/config';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch('https://api.resend.com/emails', {
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` }
  });
  const data = await res.json();
  console.log(data);
}
test();
