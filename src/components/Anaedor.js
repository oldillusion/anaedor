import React, {Component} from 'react';
import './Anaedor.css';

const rootNotes = [
    'A', 'B&#9837;', 'B', 'C', 'D&#9837;', 'D', 'E&#9837;', 'E', 'F', 'G&#9837;', 'G', 'A&#9837;'
];
const modes = ['Ionian (major)', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian (minor)', 'Locrian'];
const modeFormulae = [
    [2, 2, 1, 2, 2, 2, 1], // Ionian - Major
    [2, 1, 2, 2, 2, 1, 2], // Dorian
    [1, 2, 2, 2, 1, 2, 2], // Phrygian
    [2, 2, 2, 1, 2, 2, 1], // Lydian
    [2, 2, 1, 2, 2, 1, 2], // Mixolydian
    [2, 1, 2, 2, 1, 2, 2], // Aeolian - Minor
    [1, 2, 2, 1, 2, 2, 2], // Locrian
];
const triadPatterns = {
    '0,4,7': 'maj',
    '0,3,7': 'min',
    '0,3,6': 'dim'
}

class Anaedor extends Component {
    constructor() {
        super();
        this.state = {
            rootNote: 3,
            musicalMode: 0,
            scale: [],
            triads: []
        };

        this.changeRootNote = this.changeRootNote.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.randomKey = this.randomKey.bind(this);
        this.calcKeyData = this.calcKeyData.bind(this);
        this.position = this.position.bind(this);
    }

    componentDidMount = () => {
        this.calcKeyData();
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (prevState.rootNote !== this.state.rootNote || prevState.musicalMode !== this.state.musicalMode) {
            this.calcKeyData();
        }
    };

    randomKey = () => {
        this.setState({
            rootNote: Math.floor(Math.random() * 12),
            musicalMode: Math.floor(Math.random() * 7),
        });
    };

    calcKeyData = () => {
        const rootNote = parseInt(this.state.rootNote);
        const musicalMode = this.state.musicalMode;
        let position = rootNote;
        const scale = [
            rootNotes[rootNote],
            ...modeFormulae[musicalMode].map(interval => {
                position = (position + interval) % rootNotes.length;
                return rootNotes[position];
            })
        ];
        const triads = scale.slice(0, -1).map((rootNote, index) => {
            const notes = [
                scale[index],
                scale[(index + 2) % (scale.length - 1)],
                scale[(index + 4) % (scale.length - 1)]
            ];
            const firstNote = rootNotes.indexOf(notes[0]);
            let secondNote = rootNotes.indexOf(notes[1]) < firstNote ?
                rootNotes.indexOf(notes[1]) + rootNotes.length : rootNotes.indexOf(notes[1]);
            let thirdNote = rootNotes.indexOf(notes[2]) < firstNote ?
                rootNotes.indexOf(notes[2]) + rootNotes.length : rootNotes.indexOf(notes[2]);
            let numberNotation = [firstNote, secondNote, thirdNote];
            numberNotation = numberNotation.map((note, index, triad) => note - triad[0]);

            return {notes: notes, name: notes[0], quality: (triadPatterns[numberNotation.toString()] ?? 'unknown')};
        });
        this.setState({...this.state, scale: scale, triads: triads});
    };

    changeRootNote = event => {
        this.setState({...this.state, rootNote: event.target.value});
    };

    changeMode = event => {
        this.setState({...this.state, musicalMode: event.target.value});
    };

    position = (num, quality) => {
        if (isNaN(num))
            return NaN;
        let digits = String(+num).split(""),
            key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                "","I","II","III","IV","V","VI","VII","VIII","IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        const numeral = Array(+digits.join("") + 1).join("M") + roman;

        switch (quality) {
            case 'maj':
                return numeral;
            case 'min':
                return numeral.toLowerCase();
            case 'dim':
                return numeral.toLowerCase()+'&#176;'
        }
    };

    render() {
        return (
            <div className="container mx-auto px-10">
                <div className="flex flex-col md:flex-row mt-2">
                    <label className="md:w-24" htmlFor="root_note_select">Root note:</label>
                    <select
                        name="root_note_select"
                        id="root_note_select"
                        className="bg-gray-800 mt-1 block w-full md:w-48 py-2 px-3 border border-gray-300 rounded focus:outline-none sm:text-s"
                        onChange={this.changeRootNote}
                        value={this.state.rootNote}
                    >
                        {
                            rootNotes.map((note, index) =>
                                <option
                                    key={note}
                                    value={index}
                                    dangerouslySetInnerHTML={{__html: note}}
                                />
                            )
                        }
                    </select>
                </div>
                <div className="flex flex-col md:flex-row mt-2">
                    <label className="md:w-24" htmlFor="root_note_select">Mode:</label>
                    <select
                        name="root_note_select"
                        id="root_note_select"
                        className="bg-gray-800 mt-1 block w-full md:w-48 py-2 px-3 border border-gray-300 rounded focus:outline-none sm:text-s"
                        onChange={this.changeMode}
                        value={this.state.musicalMode}
                    >
                        {
                            modes.map((mode, index) =>
                                <option
                                    key={mode}
                                    value={index}
                                    dangerouslySetInnerHTML={{__html: mode}}
                                />
                            )
                        }
                    </select>
                </div>
                <div className="flex flex-row mt-4">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={this.randomKey}>Random</button>
                </div>
                <hr className="my-4 max-w-4xl"/>
                {this.state.scale.length > 0 &&
                    <>
                        <div
                            className="flex flex-row gap-x-4 text-xl max-w-4xl"
                        >
                            {
                                this.state.scale.map(note =>
                                    <div
                                        className="flex-auto text-black text-center bg-white border rounded-md border-gray-300 py-2"
                                        dangerouslySetInnerHTML={{__html: note}}
                                    />
                                )
                            }
                        </div>
                        <hr className="my-4 max-w-4xl"/>
                        {
                            this.state.triads.map((triad, index) =>
                                <div className="flex flex-row gap-x-4 text-xl max-w-4xl my-4" >
                                    <div
                                        className="w-12"
                                        dangerouslySetInnerHTML={{__html: this.position(index + 1, triad.quality)}}
                                    />
                                    <div
                                        className="w-24"
                                        dangerouslySetInnerHTML={{__html: `${triad.name} ${triad.quality}`}}
                                    />
                                    <div
                                        dangerouslySetInnerHTML={{__html: triad.notes.join(' - ')}}
                                    />
                                </div>
                            )
                        }
                    </>
                }
            </div>
        );
    }
};

export default Anaedor;
