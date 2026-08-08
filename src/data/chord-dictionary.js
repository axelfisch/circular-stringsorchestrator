/**
 * SayChord Chord Dictionary v2.0
 * Dictionnaire d'accords sophistiqué d'Axel Fisch
 * Support bilingue FR/EN avec MIDI et fuzzy matching
 */

class SayChordDictionary {
    constructor() {
        this.chords = this.initializeChords();
        this.searchIndex = this.buildSearchIndex();
    }

    /**
     * Initialise le dictionnaire d'accords complet
     */
    initializeChords() {
        return {
            // Accords majeurs
            "Cmaj7": {
                id: "Cmaj7",
                locales: {
                    fr: "Do majeur septième",
                    en: "C major seventh"
                },
                root: "C",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Cmaj7", "CΔ7", "CM7", "Cmajor7",
                    "Do majeur 7", "Do majeur septième", "Do maj7",
                    "C major 7", "C major seventh"
                ],
                spelling: ["C", "E", "G", "B"],
                midi: [60, 64, 67, 71],
                tags: ["major", "seventh", "stable"]
            },

            "Dmaj7": {
                id: "Dmaj7",
                locales: {
                    fr: "Ré majeur septième",
                    en: "D major seventh"
                },
                root: "D",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Dmaj7", "DΔ7", "DM7", "Dmajor7",
                    "Ré majeur 7", "Ré majeur septième", "Ré maj7",
                    "D major 7", "D major seventh"
                ],
                spelling: ["D", "F#", "A", "C#"],
                midi: [62, 66, 69, 73],
                tags: ["major", "seventh", "stable"]
            },

            "Emaj7": {
                id: "Emaj7",
                locales: {
                    fr: "Mi majeur septième",
                    en: "E major seventh"
                },
                root: "E",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Emaj7", "EΔ7", "EM7", "Emajor7",
                    "Mi majeur 7", "Mi majeur septième", "Mi maj7",
                    "E major 7", "E major seventh"
                ],
                spelling: ["E", "G#", "B", "D#"],
                midi: [64, 68, 71, 75],
                tags: ["major", "seventh", "stable"]
            },

            "Fmaj7": {
                id: "Fmaj7",
                locales: {
                    fr: "Fa majeur septième",
                    en: "F major seventh"
                },
                root: "F",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Fmaj7", "FΔ7", "FM7", "Fmajor7",
                    "Fa majeur 7", "Fa majeur septième", "Fa maj7",
                    "F major 7", "F major seventh"
                ],
                spelling: ["F", "A", "C", "E"],
                midi: [65, 69, 72, 76],
                tags: ["major", "seventh", "stable"]
            },

            "Gmaj7": {
                id: "Gmaj7",
                locales: {
                    fr: "Sol majeur septième",
                    en: "G major seventh"
                },
                root: "G",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Gmaj7", "GΔ7", "GM7", "Gmajor7",
                    "Sol majeur 7", "Sol majeur septième", "Sol maj7",
                    "G major 7", "G major seventh"
                ],
                spelling: ["G", "B", "D", "F#"],
                midi: [67, 71, 74, 78],
                tags: ["major", "seventh", "stable"]
            },

            "Amaj7": {
                id: "Amaj7",
                locales: {
                    fr: "La majeur septième",
                    en: "A major seventh"
                },
                root: "A",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Amaj7", "AΔ7", "AM7", "Amajor7",
                    "La majeur 7", "La majeur septième", "La maj7",
                    "A major 7", "A major seventh"
                ],
                spelling: ["A", "C#", "E", "G#"],
                midi: [69, 73, 76, 80],
                tags: ["major", "seventh", "stable"]
            },

            "Bmaj7": {
                id: "Bmaj7",
                locales: {
                    fr: "Si majeur septième",
                    en: "B major seventh"
                },
                root: "B",
                quality: "maj7",
                extensions: [],
                aliases: [
                    "Bmaj7", "BΔ7", "BM7", "Bmajor7",
                    "Si majeur 7", "Si majeur septième", "Si maj7",
                    "B major 7", "B major seventh"
                ],
                spelling: ["B", "D#", "F#", "A#"],
                midi: [71, 75, 78, 82],
                tags: ["major", "seventh", "stable"]
            },

            // Accords mineurs
            "Cmin7": {
                id: "Cmin7",
                locales: {
                    fr: "Do mineur septième",
                    en: "C minor seventh"
                },
                root: "C",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Cmin7", "Cm7", "C-7", "Cminor7",
                    "Do mineur 7", "Do mineur septième", "Do min7", "Do m7",
                    "C minor 7", "C minor seventh"
                ],
                spelling: ["C", "Eb", "G", "Bb"],
                midi: [60, 63, 67, 70],
                tags: ["minor", "seventh", "subdominant"]
            },

            "Dmin7": {
                id: "Dmin7",
                locales: {
                    fr: "Ré mineur septième",
                    en: "D minor seventh"
                },
                root: "D",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Dmin7", "Dm7", "D-7", "Dminor7",
                    "Ré mineur 7", "Ré mineur septième", "Ré min7", "Ré m7",
                    "D minor 7", "D minor seventh"
                ],
                spelling: ["D", "F", "A", "C"],
                midi: [62, 65, 69, 72],
                tags: ["minor", "seventh", "subdominant"]
            },

            "Emin7": {
                id: "Emin7",
                locales: {
                    fr: "Mi mineur septième",
                    en: "E minor seventh"
                },
                root: "E",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Emin7", "Em7", "E-7", "Eminor7",
                    "Mi mineur 7", "Mi mineur septième", "Mi min7", "Mi m7",
                    "E minor 7", "E minor seventh"
                ],
                spelling: ["E", "G", "B", "D"],
                midi: [64, 67, 71, 74],
                tags: ["minor", "seventh", "subdominant"]
            },

            "Fmin7": {
                id: "Fmin7",
                locales: {
                    fr: "Fa mineur septième",
                    en: "F minor seventh"
                },
                root: "F",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Fmin7", "Fm7", "F-7", "Fminor7",
                    "Fa mineur 7", "Fa mineur septième", "Fa min7", "Fa m7",
                    "F minor 7", "F minor seventh"
                ],
                spelling: ["F", "Ab", "C", "Eb"],
                midi: [65, 68, 72, 75],
                tags: ["minor", "seventh", "subdominant"]
            },

            "Gmin7": {
                id: "Gmin7",
                locales: {
                    fr: "Sol mineur septième",
                    en: "G minor seventh"
                },
                root: "G",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Gmin7", "Gm7", "G-7", "Gminor7",
                    "Sol mineur 7", "Sol mineur septième", "Sol min7", "Sol m7",
                    "G minor 7", "G minor seventh"
                ],
                spelling: ["G", "Bb", "D", "F"],
                midi: [67, 70, 74, 77],
                tags: ["minor", "seventh", "subdominant"]
            },

            "Amin7": {
                id: "Amin7",
                locales: {
                    fr: "La mineur septième",
                    en: "A minor seventh"
                },
                root: "A",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Amin7", "Am7", "A-7", "Aminor7",
                    "La mineur 7", "La mineur septième", "La min7", "La m7",
                    "A minor 7", "A minor seventh"
                ],
                spelling: ["A", "C", "E", "G"],
                midi: [69, 72, 76, 79],
                tags: ["minor", "seventh", "subdominant"]
            },

            "Bmin7": {
                id: "Bmin7",
                locales: {
                    fr: "Si mineur septième",
                    en: "B minor seventh"
                },
                root: "B",
                quality: "min7",
                extensions: [],
                aliases: [
                    "Bmin7", "Bm7", "B-7", "Bminor7",
                    "Si mineur 7", "Si mineur septième", "Si min7", "Si m7",
                    "B minor 7", "B minor seventh"
                ],
                spelling: ["B", "D", "F#", "A"],
                midi: [71, 74, 78, 81],
                tags: ["minor", "seventh", "subdominant"]
            },

            // Accords de dominante
            "C7": {
                id: "C7",
                locales: {
                    fr: "Do septième",
                    en: "C seventh"
                },
                root: "C",
                quality: "7",
                extensions: [],
                aliases: [
                    "C7", "Cdom7", "C dominant 7",
                    "Do 7", "Do septième", "Do dominant",
                    "C 7", "C seventh", "C dominant"
                ],
                spelling: ["C", "E", "G", "Bb"],
                midi: [60, 64, 67, 70],
                tags: ["dominant", "seventh", "tension"]
            },

            "D7": {
                id: "D7",
                locales: {
                    fr: "Ré septième",
                    en: "D seventh"
                },
                root: "D",
                quality: "7",
                extensions: [],
                aliases: [
                    "D7", "Ddom7", "D dominant 7",
                    "Ré 7", "Ré septième", "Ré dominant",
                    "D 7", "D seventh", "D dominant"
                ],
                spelling: ["D", "F#", "A", "C"],
                midi: [62, 66, 69, 72],
                tags: ["dominant", "seventh", "tension"]
            },

            "E7": {
                id: "E7",
                locales: {
                    fr: "Mi septième",
                    en: "E seventh"
                },
                root: "E",
                quality: "7",
                extensions: [],
                aliases: [
                    "E7", "Edom7", "E dominant 7",
                    "Mi 7", "Mi septième", "Mi dominant",
                    "E 7", "E seventh", "E dominant"
                ],
                spelling: ["E", "G#", "B", "D"],
                midi: [64, 68, 71, 74],
                tags: ["dominant", "seventh", "tension"]
            },

            "F7": {
                id: "F7",
                locales: {
                    fr: "Fa septième",
                    en: "F seventh"
                },
                root: "F",
                quality: "7",
                extensions: [],
                aliases: [
                    "F7", "Fdom7", "F dominant 7",
                    "Fa 7", "Fa septième", "Fa dominant",
                    "F 7", "F seventh", "F dominant"
                ],
                spelling: ["F", "A", "C", "Eb"],
                midi: [65, 69, 72, 75],
                tags: ["dominant", "seventh", "tension"]
            },

            "G7": {
                id: "G7",
                locales: {
                    fr: "Sol septième",
                    en: "G seventh"
                },
                root: "G",
                quality: "7",
                extensions: [],
                aliases: [
                    "G7", "Gdom7", "G dominant 7",
                    "Sol 7", "Sol septième", "Sol dominant",
                    "G 7", "G seventh", "G dominant"
                ],
                spelling: ["G", "B", "D", "F"],
                midi: [67, 71, 74, 77],
                tags: ["dominant", "seventh", "tension"]
            },

            "A7": {
                id: "A7",
                locales: {
                    fr: "La septième",
                    en: "A seventh"
                },
                root: "A",
                quality: "7",
                extensions: [],
                aliases: [
                    "A7", "Adom7", "A dominant 7",
                    "La 7", "La septième", "La dominant",
                    "A 7", "A seventh", "A dominant"
                ],
                spelling: ["A", "C#", "E", "G"],
                midi: [69, 73, 76, 79],
                tags: ["dominant", "seventh", "tension"]
            },

            "B7": {
                id: "B7",
                locales: {
                    fr: "Si septième",
                    en: "B seventh"
                },
                root: "B",
                quality: "7",
                extensions: [],
                aliases: [
                    "B7", "Bdom7", "B dominant 7",
                    "Si 7", "Si septième", "Si dominant",
                    "B 7", "B seventh", "B dominant"
                ],
                spelling: ["B", "D#", "F#", "A"],
                midi: [71, 75, 78, 81],
                tags: ["dominant", "seventh", "tension"]
            },

            // Accords sophistiqués d'Axel Fisch
            "Fmaj7#11": {
                id: "Fmaj7#11",
                locales: {
                    fr: "Fa majeur septième dièse onze",
                    en: "F major seventh sharp eleven"
                },
                root: "F",
                quality: "maj7",
                extensions: ["#11"],
                aliases: [
                    "Fmaj7#11", "FΔ7#11", "FM7#11", "Fmaj7(#11)",
                    "Fa majeur 7 #11", "Fa lydien", "F lydian",
                    "F major 7 #11", "F major seventh sharp eleven"
                ],
                spelling: ["F", "A", "C", "E", "B"],
                midi: [65, 69, 72, 76, 83],
                tags: ["major", "seventh", "lydian", "bright", "maj#11"]
            },

            "Dmin13": {
                id: "Dmin13",
                locales: {
                    fr: "Ré mineur treize",
                    en: "D minor thirteenth"
                },
                root: "D",
                quality: "min7",
                extensions: ["9", "11", "13"],
                aliases: [
                    "Dmin13", "Dm13", "D-13", "Dmin7(9,11,13)",
                    "Ré mineur 13", "Ré dorien", "D dorian",
                    "D minor 13", "D minor thirteenth"
                ],
                spelling: ["D", "F", "A", "C", "E", "G", "B"],
                midi: [62, 65, 69, 72, 76, 79, 83],
                tags: ["minor", "thirteenth", "dorian", "complex"]
            },

            "G11": {
                id: "G11",
                locales: {
                    fr: "Sol onze",
                    en: "G eleventh"
                },
                root: "G",
                quality: "7",
                extensions: ["9", "11"],
                aliases: [
                    "G11", "G7(9,11)", "Gdom11",
                    "Sol 11", "Sol onze", "Sol mixolydien",
                    "G 11", "G eleventh", "G mixolydian"
                ],
                spelling: ["G", "B", "D", "F", "A", "C"],
                midi: [67, 71, 74, 77, 81, 84],
                tags: ["dominant", "eleventh", "mixolydian", "sus"]
            },

            "Amin9#5": {
                id: "Amin9#5",
                locales: {
                    fr: "La mineur neuf dièse cinq",
                    en: "A minor ninth sharp five"
                },
                root: "A",
                quality: "min7",
                extensions: ["9", "#5"],
                aliases: [
                    "Amin9#5", "Am9#5", "A-9#5", "Amin7(9,#5)",
                    "La mineur 9 #5", "La aeolien #5",
                    "A minor 9 #5", "A minor ninth sharp five"
                ],
                spelling: ["A", "C", "E#", "G", "B"],
                midi: [69, 72, 77, 79, 83],
                tags: ["minor", "ninth", "altered", "aeolian"]
            },

            "Bmin7b5": {
                id: "Bmin7b5",
                locales: {
                    fr: "Si mineur septième bémol cinq",
                    en: "B minor seventh flat five"
                },
                root: "B",
                quality: "min7b5",
                extensions: [],
                aliases: [
                    "Bmin7b5", "Bm7b5", "B-7b5", "Bø7", "B half-diminished",
                    "Si mineur 7 b5", "Si demi-diminué", "Si locrien",
                    "B minor 7 b5", "B half-diminished", "B locrian"
                ],
                spelling: ["B", "D", "F", "A"],
                midi: [71, 74, 77, 81],
                tags: ["minor", "seventh", "flat5", "locrian", "half-dim"]
            },

            // Accords altérés avancés
            "C7alt": {
                id: "C7alt",
                locales: {
                    fr: "Do septième altéré",
                    en: "C seventh altered"
                },
                root: "C",
                quality: "7alt",
                extensions: ["b9", "#9", "#11", "b13"],
                aliases: [
                    "C7alt", "C7(b9,#9,#11,b13)", "C altered",
                    "Do 7 altéré", "Do altéré", "Do super locrien",
                    "C 7 altered", "C altered", "C super locrian"
                ],
                spelling: ["C", "E", "G", "Bb", "Db", "D#", "F#", "Ab"],
                midi: [60, 64, 67, 70, 73, 75, 78, 80],
                tags: ["dominant", "altered", "tension", "super-locrian"]
            },

            "Dbmaj7#11": {
                id: "Dbmaj7#11",
                locales: {
                    fr: "Ré♭ majeur septième dièse onze",
                    en: "Db major seventh sharp eleven"
                },
                root: "Db",
                quality: "maj7",
                extensions: ["#11"],
                aliases: [
                    "Dbmaj7#11", "C#maj7#11", "DbΔ7#11", "C#Δ7#11",
                    "Ré bémol majeur 7 #11", "Do dièse majeur 7 #11",
                    "Db major 7 #11", "C# major 7 #11"
                ],
                spelling: ["Db", "F", "Ab", "C", "G"],
                midi: [61, 65, 68, 72, 79],
                tags: ["major", "seventh", "lydian", "bright", "maj#11"]
            }
        };
    }

    /**
     * Construit l'index de recherche pour le fuzzy matching
     */
    buildSearchIndex() {
        const index = new Map();
        
        Object.values(this.chords).forEach(chord => {
            // Index par ID
            index.set(chord.id.toLowerCase(), chord);
            
            // Index par aliases
            chord.aliases.forEach(alias => {
                index.set(alias.toLowerCase(), chord);
            });
            
            // Index par noms localisés
            Object.values(chord.locales).forEach(name => {
                index.set(name.toLowerCase(), chord);
            });
        });
        
        return index;
    }

    /**
     * Recherche exacte d'un accord
     */
    findExact(query) {
        const normalizedQuery = query.toLowerCase().trim();
        return this.searchIndex.get(normalizedQuery) || null;
    }

    /**
     * Recherche tous les accords
     */
    getAllChords() {
        return Object.values(this.chords);
    }

    /**
     * Recherche par root note
     */
    findByRoot(root) {
        const normalizedRoot = root.toUpperCase();
        return Object.values(this.chords).filter(chord => 
            chord.root === normalizedRoot
        );
    }

    /**
     * Recherche par quality
     */
    findByQuality(quality) {
        return Object.values(this.chords).filter(chord => 
            chord.quality === quality
        );
    }

    /**
     * Recherche par tags
     */
    findByTag(tag) {
        return Object.values(this.chords).filter(chord => 
            chord.tags.includes(tag)
        );
    }

    /**
     * Obtient tous les aliases d'un accord
     */
    getAllAliases() {
        const aliases = [];
        Object.values(this.chords).forEach(chord => {
            aliases.push(...chord.aliases);
            aliases.push(...Object.values(chord.locales));
        });
        return [...new Set(aliases)]; // Remove duplicates
    }

    /**
     * Obtient les informations d'un accord par ID
     */
    getChordInfo(chordId) {
        return this.chords[chordId] || null;
    }

    /**
     * Convertit les notes MIDI en noms de notes
     */
    midiToNoteNames(midiNotes) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return midiNotes.map(midi => {
            const octave = Math.floor(midi / 12) - 1;
            const noteIndex = midi % 12;
            return noteNames[noteIndex] + octave;
        });
    }

    /**
     * Obtient les statistiques du dictionnaire
     */
    getStats() {
        const chords = Object.values(this.chords);
        const qualities = [...new Set(chords.map(c => c.quality))];
        const roots = [...new Set(chords.map(c => c.root))];
        const tags = [...new Set(chords.flatMap(c => c.tags))];
        
        return {
            totalChords: chords.length,
            qualities: qualities.length,
            roots: roots.length,
            tags: tags.length,
            averageAliases: chords.reduce((sum, c) => sum + c.aliases.length, 0) / chords.length
        };
    }
}

// Instance globale
window.SayChordDictionary = SayChordDictionary;

