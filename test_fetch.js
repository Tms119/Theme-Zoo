async function run() {
  const fileUrl = "https://frugal-cobra-312.convex.cloud/api/storage/a30f7e79-c17b-4b90-bcae-308c24a7c43a";
  const res = await fetch(fileUrl, { redirect: 'manual' });
  console.log("Status:", res.status);
  console.log("Headers:", Array.from(res.headers.entries()));
}
run();
