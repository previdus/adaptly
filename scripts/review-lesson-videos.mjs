import fs from 'node:fs/promises';

const source = JSON.parse(await fs.readFile(new URL('./lesson-video-candidates.json', import.meta.url), 'utf8'));
const candidates = [...new Map(source.flatMap(row => row.candidates).map(video => [video.id, video])).values()];
const metadata = [];
for (let start = 0; start < candidates.length; start += 6) {
  await Promise.all(candidates.slice(start, start + 6).map(async video => {
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      metadata.push({ id: video.id, title: data.title, channel: data.author_name, source: url, metadataAvailable: true });
    } catch (error) {
      metadata.push({ id: video.id, source: url, metadataAvailable: false, error: error.message });
    }
  }));
}
await fs.writeFile(new URL('./lesson-video-metadata.json', import.meta.url), JSON.stringify(metadata, null, 2) + '\n');
console.log(`Checked ${metadata.length} publisher metadata records; ${metadata.filter(item => item.metadataAvailable).length} available. This is not a full playback review.`);
