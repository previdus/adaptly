import assert from 'node:assert/strict';
import { it } from 'node:test';
import { selectNarrationVoice } from '../lib/narration';
it('prefers an installed English voice and handles voices loading later', () => {
  assert.equal(selectNarrationVoice([]), undefined);
  const voices = [
    {lang: 'fr-FR', localService: true},
    {lang: 'en-US', localService: false},
    {lang: 'en-IN', localService: true}
  ];
  assert.equal(selectNarrationVoice(voices), voices[2]);
  assert.equal(selectNarrationVoice([voices[0]]), undefined);
});
