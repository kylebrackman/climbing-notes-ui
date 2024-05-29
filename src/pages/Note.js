import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import NotFound from '../components/NotFound';
import { baseUrl } from '../shared';
import { LoginContext } from '../App';

export default function Note() {
    const [loggedIn, setLoggedIn] = useContext(LoginContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState();
    const [tempNote, setTempNote] = useState();
    const [notFound, setNotFound] = useState();
    const [changed, setChanged] = useState(false);
    const [error, setError] = useState();

    const location = useLocation();

    useEffect(() => {
        if (!note) return;
        if (!note) return;

        let equal = true;
        if (note.name !== tempNote.name) equal = false;
        if (note.industry !== tempNote.industry) equal = false;

        if (equal) setChanged(false);
    });

    useEffect(() => {
        const url = baseUrl + 'api/notes/' + id;
        fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('access'),
            },
        })
            .then((response) => {
                if (response.status === 404) {
                    //render a 404 component in this page
                    setNotFound(true);
                } else if (response.status === 401) {
                    setLoggedIn(false);
                    navigate('/login', {
                        state: {
                            previousUrl: location.pathname,
                        },
                    });
                }

                if (!response.ok) {
                    throw new Error('Something went wrong, try again later');
                }

                return response.json();
            })
            .then((data) => {
                setNote(data.note);
                setTempNote(data.note);
                setError(undefined);
            })
            .catch((e) => {
                setError(e.message);
            });
    }, []);

    function updateNote(e) {
        e.preventDefault();
        const url = baseUrl + 'api/notes/' + id;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('access'),
            },
            body: JSON.stringify(tempNote),
        })
            .then((response) => {
                if (response.status === 401) {
                    setLoggedIn(false);
                    navigate('/login', {
                        state: {
                            previousUrl: location.pathname,
                        },
                    });
                }
                if (!response.ok) throw new Error('something went wrong');
                return response.json();
            })
            .then((data) => {
                setNote(data.note);
                setChanged(false);
                setError(undefined);
            })
            .catch((e) => {
                setError(e.message);
            });
    }

    return (
        <div class="p-3">
            {notFound ? <p>The note with id {id} was not found</p> : null}

            {note ? (
                <div>
                    <form
                        className="w-full max-w-sm"
                        id="note"
                        onSubmit={updateNote}
                    >
                        <div className="md:flex md:items-center mb-6">
                            <div className="md:w-1/4">
                                <label for="name">Name</label>
                            </div>

                            <div className="md:w-3/4">
                                <input
                                    className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                    id="name"
                                    type="text"
                                    value={tempNote.name}
                                    onChange={(e) => {
                                        setChanged(true);
                                        setTempNote({
                                            ...tempNote,
                                            name: e.target.value,
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="md:flex md:items-center mb-6">
                            <div className="md:w-1/4">
                                <label for="industry">Industry</label>
                            </div>

                            <div className="md:w-3/4">
                                <input
                                    id="industry"
                                    className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                    type="text"
                                    value={tempNote.industry}
                                    onChange={(e) => {
                                        setChanged(true);
                                        setTempNote({
                                            ...tempNote,
                                            industry: e.target.value,
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </form>
                    {changed ? (
                        <div className="mb-2">
                            <button
                                className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-2 px-4 mr-2 rounded"
                                onClick={(e) => {
                                    setTempNote({ ...note });
                                    setChanged(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                form="note"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Save
                            </button>
                        </div>
                    ) : null}

                    <div>
                        <button
                            className="bg-slate-800 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded"
                            onClick={(e) => {
                                const url = baseUrl + 'api/notes/' + id;
                                fetch(url, {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization:
                                            'Bearer ' +
                                            localStorage.getItem('access'),
                                    },
                                })
                                    .then((response) => {
                                        if (response.status === 401) {
                                            setLoggedIn(false);
                                            navigate('/login', {
                                                state: {
                                                    previousUrl:
                                                        location.pathname,
                                                },
                                            });
                                        }
                                        if (!response.ok) {
                                            throw new Error(
                                                'Something went wrong'
                                            );
                                        }
                                        navigate('/notes');
                                    })
                                    .catch((e) => {
                                        setError(e.message);
                                    });
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ) : null}

            {error ? <p>{error}</p> : null}
            <br />
            <Link to="/notes">
                <button className="no-underline bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    ← Go back
                </button>
            </Link>
        </div>
    );
}
