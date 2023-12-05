import { createContext, useContext, useReducer, ReactNode, useState } from "react"
import {
    NOTE_ACTION,
    Note,
    CreateNoteAction,
    DeleteNoteAction,
    UpdateNoteAction,
    GetNoteAction,
    GetNotesAction,
    NoteId,
    SyncedNote,
    UnSyncedNote,
    SearchNotesAction,
} from '../shared/types';
import {
    getNotes as getNotesApi,
    createNote as createNoteApi,
    updateNote as updateNoteApi,
    deleteNote as deleteNoteApi,
    uploadImageToStorage
} from '../apis/NoteAPI'
import camelcaseKeys from 'camelcase-keys';



interface NotesProviderProps {
    children: ReactNode;
}


type NoteAction = GetNoteAction | GetNotesAction | CreateNoteAction | DeleteNoteAction | UpdateNoteAction | SearchNotesAction;


const reducer = (state: Note[], action: NoteAction): Note[] => {
    console.log("reducer called")
    switch (action.type) {
        case NOTE_ACTION.CREATE_NOTE:
            return [action.payload, ...state];
        case NOTE_ACTION.DELETE_NOTE:
            return state.filter(note => note.id !== action.payload);
        case NOTE_ACTION.UPDATE_NOTE:
            return state.map(note => note.id === (action.payload ? action.payload.id : null) ? action.payload : note);
        case NOTE_ACTION.GET_NOTES:
            return action.payload;
        case NOTE_ACTION.SEARCH_NOTES:
            console.log("searchNotes called")
            return action.payload; // return the filtered notes
        default:
            return state;
    }
}

type NotesContextType = {
    notes: Note[];
    createNote: (note: Note) => void;
    deleteNote: (id: NoteId) => void;
    updateNote: (note: Note) => void;
    getNotes: () => Promise<Note[]>;
    searchNotes: (query: string) => void;
};

const NotesContext = createContext<NotesContextType>({
    notes: [],
    createNote: (note: Note) => { },
    deleteNote: (id: NoteId) => { },
    updateNote: (note: Note) => { },
    getNotes: () => Promise.resolve([]),
    searchNotes: (query: string) => { },
});



const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
    const [notes, dispatch] = useReducer(reducer, [])
    const [searchResults, setSearchResults] = useState(notes);


    async function blobUrlToFile(blobUrl: string, filename: string): Promise<File> {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });
        return file;
    }

    const createNote = async (unSyncedNote: UnSyncedNote) => {
        try {
            console.log("00000")
            console.log("unSyncedNote", unSyncedNote)
            // create file object from blob url
            const filePromises = unSyncedNote.images!.map((image, index) => blobUrlToFile(image.url, `filename${index}`));

            console.log("11111")
            // upload pics
            const uploadedImagesPromises = unSyncedNote.images!.map((image) =>
                blobUrlToFile(image.url, image.NoteImageId).then(file => uploadImageToStorage(file, unSyncedNote.userId!, image.NoteImageId))
            );

            console.log("22222")

            let response = await createNoteApi(unSyncedNote);
            dispatch({ type: NOTE_ACTION.CREATE_NOTE, payload: unSyncedNote });
            console.log("33333")
        } catch (err) {
            throw err;
        }
    }

    const deleteNote = async (noteId: NoteId) => {
        try {
            let response = await deleteNoteApi(noteId);
            dispatch({ type: NOTE_ACTION.DELETE_NOTE, payload: noteId })
        } catch (err) {
            throw err;
        }
    }



    const updateNote = async (unSyncedNote: UnSyncedNote) => {
        try {
            let response = await updateNoteApi(unSyncedNote);
            dispatch({ type: NOTE_ACTION.UPDATE_NOTE, payload: unSyncedNote })

        } catch (err) {
            throw err;
        }
    }

    /**
     * Fetches notes from the API and updates the state.
     * @param notes - The array of synced notes.
     */
    const getNotes = async (): Promise<Note[]> => {
        //Connect to API and fetch all notes
        let _notes: SyncedNote[] = await getNotesApi();
        // conert snakecase to camelcase by using camelcaseKeys
        _notes = camelcaseKeys(_notes, { deep: true });
        _notes = _notes.map(note => ({
            ...note,
            updatedAt: new Date(note.updatedAt),
            createdAt: new Date(note.createdAt)
        }));
        console.log("getNotes called")
        // console.log(_notes)
        _notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        dispatch({ type: NOTE_ACTION.GET_NOTES, payload: _notes })
        return _notes;
    }

    // Modify the searchNotes function
    const searchNotes = (query: string) => {
        console.log("triggered searchNotes");
        console.log(query)

        if (query) {
            const _notes = notes.filter(note => note.body.includes(query));
            setSearchResults(_notes);
        } else {
            // When the search query is cleared, set searchResults back to notes
            setSearchResults(notes);
        }
    }




    return (
        <NotesContext.Provider value={{ notes, createNote, deleteNote, updateNote, getNotes, searchNotes }}>
            {children}
        </NotesContext.Provider>
    )
}

const useNotes = () => {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error("useNotes must be used within a NotesProvider")
    }
    return context;
}

export { NotesProvider, useNotes }