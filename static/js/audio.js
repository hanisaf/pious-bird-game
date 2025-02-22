class AudioManager {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.phrases = [
            "سبحان الله",
            "الحمد لله",
            "لا إله إلا الله",
            "الله أكبر"
        ];
        this.currentPhraseIndex = 0;
        this.gameOverPhrase = "الحمد لله على كل حال";
    }

    playRandomPhrase() {
        // Play a simple tone for success
        this.synth.triggerAttackRelease("C4", "8n");

        // Get current phrase and increment index
        const phrase = this.phrases[this.currentPhraseIndex];
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        return phrase;
    }

    playGameOver() {
        // Play a lower tone for game over
        this.synth.triggerAttackRelease("G3", "4n");
        return this.gameOverPhrase;
    }
}