import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import api from '../services/api';

const CATEGORY_INFO = {
    II: {
        name: 'Tata Kelola',
        shortName: 'II',
    },

    III: {
        name: 'Pengelolaan Risiko',
        shortName: 'III',
    },

    IV: {
        name: 'Kerangka Kerja Keamanan Informasi',
        shortName: 'IV',
    },

    V: {
        name: 'Pengelolaan Aset',
        shortName: 'V',
    },

    VI: {
        name: 'Teknologi',
        shortName: 'VI',
    },

    VII: {
        name: 'Perlindungan Data Pribadi',
        shortName: 'VII',
    },

    VIII: {
        name: 'Suplemen',
        shortName: 'VIII',
    },
};

const CATEGORY_ORDER = [
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
];

const ANSWER_OPTIONS = [
    {
        value: 'Tidak Dilakukan',
        label: 'Tidak Dilakukan',
    },
    {
        value: 'Dalam Perencanaan',
        label: 'Dalam Perencanaan',
    },
    {
        value: 'Dalam Penerapan',
        label: 'Dalam Penerapan / Diterapkan Sebagian',
    },
    {
        value: 'Diterapkan Secara Menyeluruh',
        label: 'Diterapkan Secara Menyeluruh',
    },
];

function AdditionalAssessment() {
    const {
        assessmentId,
    } = useParams();

    const navigate =
        useNavigate();

    const [
        assessment,
        setAssessment,
    ] = useState(null);

    const [
        questions,
        setQuestions,
    ] = useState([]);

    const [
        answers,
        setAnswers,
    ] = useState({});

    const [
        activeCategory,
        setActiveCategory,
    ] = useState('II');

    const [
        activeQuestionIndex,
        setActiveQuestionIndex,
    ] = useState(0);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState('');

    const [
        error,
        setError,
    ] = useState('');

    useEffect(() => {
        loadAssessment();
    }, [assessmentId]);

    const loadAssessment =
        async () => {
            try {
                setLoading(true);
                setError('');

                const [
                    assessmentResponse,
                    questionsResponse,
                ] = await Promise.all([
                    api.get(
                        `/assessments/${assessmentId}`
                    ),

                    api.get(
                        `/assessments/${assessmentId}/additional-answers`
                    ),
                ]);

                const assessmentData =
                    assessmentResponse
                        .data
                        .data;

                const questionData =
                    questionsResponse
                        .data
                        .data
                        ?.questions || [];

                setAssessment(
                    assessmentData
                );

                setQuestions(
                    questionData
                );

                const answerState = {};

                (
                    assessmentData
                        .additionalAnswers ||
                    []
                ).forEach(
                    (answer) => {
                        answerState[
                            answer
                                .additional_question_id
                        ] = {
                            answer:
                                answer.answer ||
                                '',

                            evidence:
                                answer.evidence ||
                                '',

                            notes:
                                answer.notes ||
                                '',

                            answerId:
                                answer.id,
                        };
                    }
                );

                /*
                 * Fallback apabila endpoint
                 * assessment tidak mengembalikan
                 * additionalAnswers.
                 *
                 * Data jawaban dari endpoint
                 * additional-answers tetap
                 * digunakan.
                 */
                questionData.forEach(
                    (question) => {
                        if (
                            !answerState[
                                question.id
                            ]
                        ) {
                            answerState[
                                question.id
                            ] = {
                                answer:
                                    question.answer ||
                                    '',

                                evidence:
                                    question.evidence ||
                                    '',

                                notes:
                                    question.notes ||
                                    '',
                            };
                        }
                    }
                );

                setAnswers(
                    answerState
                );

                /*
                 * Buka pertanyaan pertama
                 * yang belum dijawab.
                 */
                const firstUnanswered =
                    questionData.findIndex(
                        (question) => {
                            const current =
                                answerState[
                                    question.id
                                ];

                            return (
                                !current ||
                                !current.answer
                            );
                        }
                    );

                if (
                    firstUnanswered >= 0
                ) {
                    const firstQuestion =
                        questionData[
                            firstUnanswered
                        ];

                    setActiveCategory(
                        firstQuestion.category
                    );

                    const categoryQuestions =
                        questionData.filter(
                            (question) =>
                                question.category ===
                                firstQuestion.category
                        );

                    const categoryIndex =
                        categoryQuestions.findIndex(
                            (question) =>
                                question.id ===
                                firstQuestion.id
                        );

                    setActiveQuestionIndex(
                        categoryIndex >= 0
                            ? categoryIndex
                            : 0
                    );
                } else if (
                    questionData.length > 0
                ) {
                    setActiveCategory(
                        questionData[0]
                            .category
                    );

                    setActiveQuestionIndex(
                        0
                    );
                }
            } catch (err) {
                console.error(
                    'Gagal memuat Additional Assessment:',
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    'Additional Assessment gagal dimuat.'
                );
            } finally {
                setLoading(false);
            }
        };

    const categoryQuestions =
        useMemo(() => {
            return questions.filter(
                (question) =>
                    question.category ===
                    activeCategory
            );
        }, [
            questions,
            activeCategory,
        ]);

    const currentQuestion =
        categoryQuestions[
            activeQuestionIndex
        ] || null;

    const answeredCount =
        questions.filter(
            (question) => {
                const answer =
                    answers[
                        question.id
                    ];

                return (
                    answer &&
                    answer.answer
                );
            }
        ).length;

    const totalQuestions =
        questions.length || 21;

    const progressPercentage =
        totalQuestions > 0
            ? Math.round(
                (
                    answeredCount /
                    totalQuestions
                ) *
                100
            )
            : 0;

    const currentAnswer =
        currentQuestion
            ? answers[
                currentQuestion.id
            ] || {
                answer: '',
                evidence: '',
                notes: '',
            }
            : {
                answer: '',
                evidence: '',
                notes: '',
            };

    const updateAnswer = (
        questionId,
        field,
        value
    ) => {
        setAnswers(
            (previous) => ({
                ...previous,

                [questionId]: {
                    ...(previous[
                        questionId
                    ] || {}),

                    [field]: value,
                },
            })
        );

        setMessage('');
        setError('');
    };

    const saveCurrentAnswer =
        async () => {
            if (!currentQuestion) {
                return null;
            }

            const current =
                answers[
                    currentQuestion.id
                ] || {};

            if (!current.answer) {
                setError(
                    'Silakan pilih jawaban terlebih dahulu.'
                );

                return null;
            }

            try {
                setSaving(true);
                setError('');
                setMessage('');

                const response =
                    await api.post(
                        `/assessments/${assessmentId}/additional-answers`,
                        {
                            additional_question_id:
                                currentQuestion.id,

                            answer:
                                current.answer,

                            evidence:
                                current.evidence ||
                                null,

                            notes:
                                current.notes ||
                                null,
                        }
                    );

                const savedAnswer =
                    response.data.data;

                setAnswers(
                    (previous) => ({
                        ...previous,

                        [currentQuestion.id]:
                            {
                                ...(previous[
                                    currentQuestion.id
                                ] || {}),

                                answerId:
                                    savedAnswer.id,
                            },
                    })
                );

                setMessage(
                    'Jawaban berhasil disimpan.'
                );

                return savedAnswer;
            } catch (err) {
                console.error(
                    'Gagal menyimpan jawaban:',
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    'Jawaban gagal disimpan.'
                );

                return null;
            } finally {
                setSaving(false);
            }
        };

    const openQuestion = (
        category,
        index
    ) => {
        setActiveCategory(
            category
        );

        setActiveQuestionIndex(
            index
        );

        setMessage('');
        setError('');
    };

    const handlePrevious =
        () => {
            if (
                activeQuestionIndex >
                0
            ) {
                setActiveQuestionIndex(
                    activeQuestionIndex -
                    1
                );

                setMessage('');
                setError('');

                return;
            }

            const categoryIndex =
                CATEGORY_ORDER.indexOf(
                    activeCategory
                );

            if (
                categoryIndex > 0
            ) {
                const previousCategory =
                    CATEGORY_ORDER[
                        categoryIndex -
                        1
                    ];

                const previousQuestions =
                    questions.filter(
                        (question) =>
                            question.category ===
                            previousCategory
                    );

                setActiveCategory(
                    previousCategory
                );

                setActiveQuestionIndex(
                    Math.max(
                        previousQuestions.length -
                        1,
                        0
                    )
                );

                setMessage('');
                setError('');
            }
        };

    const handleNext =
        async () => {
            const saved =
                await saveCurrentAnswer();

            if (!saved) {
                return;
            }

            if (
                activeQuestionIndex <
                categoryQuestions.length -
                1
            ) {
                setActiveQuestionIndex(
                    activeQuestionIndex +
                    1
                );

                return;
            }

            const categoryIndex =
                CATEGORY_ORDER.indexOf(
                    activeCategory
                );

            if (
                categoryIndex <
                CATEGORY_ORDER.length -
                1
            ) {
                const nextCategory =
                    CATEGORY_ORDER[
                        categoryIndex +
                        1
                    ];

                setActiveCategory(
                    nextCategory
                );

                setActiveQuestionIndex(
                    0
                );
            }
        };

    const handleSave =
        async () => {
            await saveCurrentAnswer();
        };

    const handleSaveAndCalculate =
        async () => {
            const saved =
                await saveCurrentAnswer();

            if (!saved) {
                return;
            }

            navigate(
                `/assessments/${assessmentId}/calculate`
            );
        };

    const goToKami =
        async () => {
            if (
                currentQuestion &&
                answers[
                    currentQuestion.id
                ]?.answer
            ) {
                const saved =
                    await saveCurrentAnswer();

                if (!saved) {
                    return;
                }
            }

            navigate(
                `/assessments/${assessmentId}/kami`
            );
        };

    const goToDashboard =
        async () => {
            if (
                currentQuestion &&
                answers[
                    currentQuestion.id
                ]?.answer
            ) {
                await saveCurrentAnswer();
            }

            navigate('/');
        };

    const getCategoryProgress =
        (category) => {
            const categoryItems =
                questions.filter(
                    (question) =>
                        question.category ===
                        category
                );

            const answered =
                categoryItems.filter(
                    (question) =>
                        answers[
                            question.id
                        ]?.answer
                ).length;

            return {
                answered,
                total:
                    categoryItems.length,
            };
        };

    const isFirstQuestion =
        activeCategory ===
            CATEGORY_ORDER[0] &&
        activeQuestionIndex === 0;

    const isLastQuestion =
        activeCategory ===
            CATEGORY_ORDER[
                CATEGORY_ORDER.length -
                1
            ] &&
        activeQuestionIndex ===
            categoryQuestions.length -
            1;

    if (loading) {
        return (
            <div
                style={{
                    minHeight:
                        '100vh',

                    display:
                        'flex',

                    alignItems:
                        'center',

                    justifyContent:
                        'center',

                    background:
                        '#f8fafc',

                    fontFamily:
                        'Arial, sans-serif',
                }}
            >
                Memuat Additional Assessment...
            </div>
        );
    }

    if (
        error &&
        !assessment
    ) {
        return (
            <div
                style={{
                    minHeight:
                        '100vh',

                    display:
                        'flex',

                    alignItems:
                        'center',

                    justifyContent:
                        'center',

                    background:
                        '#f8fafc',

                    padding:
                        '24px',
                }}
            >
                <div
                    style={{
                        background:
                            '#ffffff',

                        padding:
                            '30px',

                        borderRadius:
                            '12px',

                        maxWidth:
                            '600px',

                        width:
                            '100%',
                    }}
                >
                    <h2>
                        Additional Assessment
                        gagal dimuat
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate('/')
                        }
                        style={{
                            padding:
                                '10px 16px',

                            border:
                                'none',

                            background:
                                '#2563eb',

                            color:
                                '#ffffff',

                            borderRadius:
                                '8px',

                            cursor:
                                'pointer',
                        }}
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div
                style={{
                    minHeight:
                        '100vh',

                    background:
                        '#f8fafc',

                    padding:
                        '40px',
                }}
            >
                <h2>
                    Pertanyaan Additional
                    Assessment tidak tersedia
                </h2>

                <button
                    onClick={() =>
                        navigate('/')
                    }
                    style={{
                        padding:
                            '10px 16px',

                        border:
                            'none',

                        background:
                            '#2563eb',

                        color:
                            '#ffffff',

                        borderRadius:
                            '8px',

                        cursor:
                            'pointer',
                    }}
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="kami-assessment-page"
            style={{
                minHeight:
                    '100vh',

                background:
                    '#f8fafc',

                fontFamily:
                    'Arial, sans-serif',

                color:
                    '#1e293b',
            }}
        >
            {/* =========================
                HEADER
            ========================== */}

            <header
                style={{
                    background:
                        '#ffffff',

                    borderBottom:
                        '1px solid #e2e8f0',

                    padding:
                        '16px 24px',

                    position:
                        'sticky',

                    top: 0,

                    zIndex: 20,
                }}
            >
                <div
                    style={{
                        maxWidth:
                            '1400px',

                        margin:
                            '0 auto',

                        display:
                            'flex',

                        justifyContent:
                            'space-between',

                        alignItems:
                            'center',

                        gap:
                            '16px',

                        flexWrap:
                            'wrap',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontWeight:
                                    '700',

                                fontSize:
                                    '18px',
                            }}
                        >
                            Additional Assessment
                        </div>

                        <div
                            style={{
                                color:
                                    '#64748b',

                                fontSize:
                                    '13px',

                                marginTop:
                                    '4px',
                            }}
                        >
                            {
                                assessment?.school_name
                            }
                        </div>
                    </div>

                    <div
                        style={{
                            display:
                                'flex',

                            gap:
                                '10px',

                            flexWrap:
                                'wrap',
                        }}
                    >
                        <button
                            onClick={
                                goToDashboard
                            }
                            style={{
                                padding:
                                    '10px 16px',

                                border:
                                    '1px solid #cbd5e1',

                                background:
                                    '#ffffff',

                                color:
                                    '#334155',

                                borderRadius:
                                    '8px',

                                cursor:
                                    'pointer',

                                fontWeight:
                                    '600',
                            }}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={
                                goToKami
                            }
                            style={{
                                padding:
                                    '10px 16px',

                                border:
                                    '1px solid #7c3aed',

                                background:
                                    '#ffffff',

                                color:
                                    '#6d28d9',

                                borderRadius:
                                    '8px',

                                cursor:
                                    'pointer',

                                fontWeight:
                                    '600',
                            }}
                        >
                            Assessment KAMI
                        </button>

                        <button
                            onClick={
                                handleSaveAndCalculate
                            }
                            disabled={
                                saving
                            }
                            style={{
                                padding:
                                    '10px 16px',

                                border:
                                    'none',

                                background:
                                    '#2563eb',

                                color:
                                    '#ffffff',

                                borderRadius:
                                    '8px',

                                cursor:
                                    'pointer',

                                fontWeight:
                                    '600',
                            }}
                        >
                            Calculate
                        </button>
                    </div>
                </div>
            </header>

            <div
                style={{
                    maxWidth:
                        '1400px',

                    margin:
                        '0 auto',

                    padding:
                        '24px',
                }}
            >
                {/* =========================
                    INFO
                ========================== */}

                <div
                    style={{
                        background:
                            '#fffbeb',

                        border:
                            '1px solid #fde68a',

                        borderRadius:
                            '12px',

                        padding:
                            '16px 20px',

                        marginBottom:
                            '20px',
                    }}
                >
                    <div
                        style={{
                            fontWeight:
                                '700',

                            color:
                                '#92400e',

                            marginBottom:
                                '5px',
                        }}
                    >
                        Additional Assessment
                    </div>

                    <div
                        style={{
                            color:
                                '#78350f',

                            fontSize:
                                '13px',

                            lineHeight:
                                '1.6',
                        }}
                    >
                        Pertanyaan pada bagian ini
                        digunakan sebagai informasi
                        pendukung kondisi keamanan
                        informasi sekolah.
                        <br />

                        <strong>
                            Hasil Additional Assessment
                            tidak masuk ke dalam
                            perhitungan skor KAMI,
                            tingkat kematangan, maupun
                            status kesiapan.
                        </strong>
                    </div>
                </div>

                {/* =========================
                    PROGRESS
                ========================== */}

                <div
                    style={{
                        background:
                            '#ffffff',

                        borderRadius:
                            '12px',

                        padding:
                            '18px 20px',

                        marginBottom:
                            '20px',

                        border:
                            '1px solid #e2e8f0',
                    }}
                >
                    <div
                        style={{
                            display:
                                'flex',

                            justifyContent:
                                'space-between',

                            marginBottom:
                                '10px',
                        }}
                    >
                        <strong>
                            Progress Additional
                            Assessment
                        </strong>

                        <span>
                            {answeredCount} /{' '}
                            {totalQuestions}{' '}
                            ({progressPercentage}%)
                        </span>
                    </div>

                    <div
                        style={{
                            height:
                                '8px',

                            background:
                                '#e2e8f0',

                            borderRadius:
                                '999px',

                            overflow:
                                'hidden',
                        }}
                    >
                        <div
                            style={{
                                width:
                                    `${progressPercentage}%`,

                                height:
                                    '100%',

                                background:
                                    '#2563eb',

                                borderRadius:
                                    '999px',
                            }}
                        />
                    </div>
                </div>

                {/* =========================
                    MAIN GRID
                ========================== */}

                <div
                    style={{
                        display:
                            'grid',

                        gridTemplateColumns:
                            '250px minmax(0, 1fr)',

                        gap:
                            '20px',

                        alignItems:
                            'start',
                    }}
                >
                    {/* =========================
                        SIDEBAR
                    ========================== */}

                    <aside
                        style={{
                            background:
                                '#ffffff',

                            borderRadius:
                                '12px',

                            border:
                                '1px solid #e2e8f0',

                            padding:
                                '14px',

                            position:
                                'sticky',

                            top:
                                '100px',
                        }}
                    >
                        <div
                            style={{
                                fontWeight:
                                    '700',

                                marginBottom:
                                    '12px',
                            }}
                        >
                            Kategori
                        </div>

                        {CATEGORY_ORDER.map(
                            (category) => {
                                const progress =
                                    getCategoryProgress(
                                        category
                                    );

                                const active =
                                    activeCategory ===
                                    category;

                                return (
                                    <button
                                        key={
                                            category
                                        }
                                        onClick={() =>
                                            openQuestion(
                                                category,
                                                0
                                            )
                                        }
                                        style={{
                                            width:
                                                '100%',

                                            textAlign:
                                                'left',

                                            padding:
                                                '11px 12px',

                                            marginBottom:
                                                '7px',

                                            border:
                                                active
                                                    ? '1px solid #2563eb'
                                                    : '1px solid #e2e8f0',

                                            background:
                                                active
                                                    ? '#eff6ff'
                                                    : '#ffffff',

                                            color:
                                                active
                                                    ? '#1d4ed8'
                                                    : '#334155',

                                            borderRadius:
                                                '8px',

                                            cursor:
                                                'pointer',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight:
                                                    '600',
                                            }}
                                        >
                                            {category}
                                            {' - '}
                                            {
                                                CATEGORY_INFO[
                                                    category
                                                ].shortName
                                            }
                                        </div>

                                        <div
                                            style={{
                                                fontSize:
                                                    '12px',

                                                marginTop:
                                                    '4px',

                                                color:
                                                    '#64748b',
                                            }}
                                        >
                                            {
                                                progress.answered
                                            }{' '}
                                            /{' '}
                                            {
                                                progress.total
                                            }
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </aside>

                    {/* =========================
                        QUESTION AREA
                    ========================== */}

                    <main>
                        <div
                            style={{
                                background:
                                    '#ffffff',

                                borderRadius:
                                    '12px',

                                border:
                                    '1px solid #e2e8f0',

                                padding:
                                    '28px',
                            }}
                        >
                            {/* QUESTION HEADER */}

                            <div
                                style={{
                                    marginBottom:
                                        '20px',
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            '#64748b',

                                        fontSize:
                                            '13px',

                                        marginBottom:
                                            '6px',
                                    }}
                                >
                                    Kategori{' '}
                                    {
                                        currentQuestion.category
                                    }
                                </div>

                                <h2
                                    style={{
                                        margin:
                                            '0 0 8px 0',

                                        fontSize:
                                            '22px',
                                    }}
                                >
                                    {
                                        CATEGORY_INFO[
                                            activeCategory
                                        ].name
                                    }
                                </h2>

                                <div
                                    style={{
                                        color:
                                            '#64748b',

                                        fontSize:
                                            '13px',
                                    }}
                                >
                                    {
                                        currentQuestion.question_number
                                    }{' '}
                                    — Pertanyaan{' '}
                                    {
                                        activeQuestionIndex +
                                        1
                                    }{' '}
                                    dari{' '}
                                    {
                                        categoryQuestions.length
                                    }
                                </div>
                            </div>

                            {/* =========================
                                QUESTION NAVIGATION
                            ========================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '24px',

                                    padding:
                                        '14px',

                                    background:
                                        '#f8fafc',

                                    border:
                                        '1px solid #e2e8f0',

                                    borderRadius:
                                        '10px',
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight:
                                            '700',

                                        fontSize:
                                            '13px',

                                        marginBottom:
                                            '10px',
                                    }}
                                >
                                    Navigation Pertanyaan
                                </div>

                                <div
                                    style={{
                                        display:
                                            'flex',

                                        flexWrap:
                                            'wrap',

                                        gap:
                                            '7px',
                                    }}
                                >
                                    {categoryQuestions.map(
                                        (
                                            question,
                                            index
                                        ) => {
                                            const answered =
                                                !!answers[
                                                    question.id
                                                ]?.answer;

                                            const active =
                                                index ===
                                                activeQuestionIndex;

                                            return (
                                                <button
                                                    key={
                                                        question.id
                                                    }
                                                    onClick={() =>
                                                        openQuestion(
                                                            activeCategory,
                                                            index
                                                        )
                                                    }
                                                    title={
                                                        question.question_number
                                                    }
                                                    style={{
                                                        width:
                                                            '40px',

                                                        height:
                                                            '36px',

                                                        borderRadius:
                                                            '7px',

                                                        border:
                                                            active
                                                                ? '2px solid #2563eb'
                                                                : answered
                                                                    ? '1px solid #16a34a'
                                                                    : '1px solid #cbd5e1',

                                                        background:
                                                            active
                                                                ? '#2563eb'
                                                                : answered
                                                                    ? '#dcfce7'
                                                                    : '#ffffff',

                                                        color:
                                                            active
                                                                ? '#ffffff'
                                                                : answered
                                                                    ? '#166534'
                                                                    : '#334155',

                                                        fontWeight:
                                                            '600',

                                                        cursor:
                                                            'pointer',
                                                    }}
                                                >
                                                    {index +
                                                        1}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                <div
                                    style={{
                                        display:
                                            'flex',

                                        gap:
                                            '16px',

                                        marginTop:
                                            '12px',

                                        fontSize:
                                            '12px',

                                        color:
                                            '#64748b',

                                        flexWrap:
                                            'wrap',
                                    }}
                                >
                                    <span>
                                        <span
                                            style={{
                                                display:
                                                    'inline-block',

                                                width:
                                                    '10px',

                                                height:
                                                    '10px',

                                                background:
                                                    '#2563eb',

                                                borderRadius:
                                                    '3px',

                                                marginRight:
                                                    '5px',
                                            }}
                                        />

                                        Sedang dibuka
                                    </span>

                                    <span>
                                        <span
                                            style={{
                                                display:
                                                    'inline-block',

                                                width:
                                                    '10px',

                                                height:
                                                    '10px',

                                                background:
                                                    '#dcfce7',

                                                border:
                                                    '1px solid #16a34a',

                                                borderRadius:
                                                    '3px',

                                                marginRight:
                                                    '5px',
                                            }}
                                        />

                                        Sudah dijawab
                                    </span>

                                    <span>
                                        <span
                                            style={{
                                                display:
                                                    'inline-block',

                                                width:
                                                    '10px',

                                                height:
                                                    '10px',

                                                background:
                                                    '#ffffff',

                                                border:
                                                    '1px solid #cbd5e1',

                                                borderRadius:
                                                    '3px',

                                                marginRight:
                                                    '5px',
                                            }}
                                        />

                                        Belum dijawab
                                    </span>
                                </div>
                            </div>

                            {/* =========================
                                QUESTION TEXT
                            ========================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '26px',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            '17px',

                                        lineHeight:
                                            '1.7',
                                    }}
                                >
                                    {
                                        currentQuestion.question
                                    }
                                </div>
                            </div>

                            {/* =========================
                                PURPOSE
                            ========================== */}

                            {currentQuestion.purpose && (
                                <div
                                    style={{
                                        marginBottom:
                                            '24px',

                                        padding:
                                            '14px',

                                        background:
                                            '#f8fafc',

                                        border:
                                            '1px solid #e2e8f0',

                                        borderRadius:
                                            '10px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight:
                                                '700',

                                            fontSize:
                                                '13px',

                                            marginBottom:
                                                '7px',
                                        }}
                                    >
                                        Tujuan
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                '#64748b',

                                            fontSize:
                                                '13px',

                                            lineHeight:
                                                '1.6',
                                        }}
                                    >
                                        {
                                            currentQuestion.purpose
                                        }
                                    </div>
                                </div>
                            )}

                            {/* =========================
                                ISO CONTROL
                            ========================== */}

                            {(
                                currentQuestion.iso_control ||
                                currentQuestion.iso_name
                            ) && (
                                <div
                                    style={{
                                        marginBottom:
                                            '24px',

                                        padding:
                                            '14px',

                                        background:
                                            '#eff6ff',

                                        border:
                                            '1px solid #bfdbfe',

                                        borderRadius:
                                            '10px',

                                        fontSize:
                                            '13px',

                                        color:
                                            '#1e3a8a',
                                    }}
                                >
                                    <strong>
                                        ISO/IEC
                                        27001:2022:
                                    </strong>{' '}

                                    {
                                        currentQuestion.iso_control
                                    }

                                    {currentQuestion.iso_name
                                        ? ` — ${currentQuestion.iso_name}`
                                        : ''}
                                </div>
                            )}

                            {/* =========================
                                ANSWER
                            ========================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '24px',
                                }}
                            >
                                <label
                                    style={{
                                        display:
                                            'block',

                                        fontWeight:
                                            '700',

                                        marginBottom:
                                            '12px',
                                    }}
                                >
                                    Jawaban
                                </label>

                                <div
                                    style={{
                                        display:
                                            'grid',

                                        gridTemplateColumns:
                                            'repeat(3, minmax(0, 1fr))',

                                        gap:
                                            '12px',
                                    }}
                                >
                                    {ANSWER_OPTIONS.map(
                                        (
                                            option
                                        ) => (
                                            <label
                                                key={
                                                    option.value
                                                }
                                                style={{
                                                    border:
                                                        currentAnswer.answer ===
                                                        option.value
                                                            ? '2px solid #2563eb'
                                                            : '1px solid #cbd5e1',

                                                    borderRadius:
                                                        '10px',

                                                    padding:
                                                        '16px',

                                                    cursor:
                                                        'pointer',

                                                    background:
                                                        currentAnswer.answer ===
                                                        option.value
                                                            ? '#eff6ff'
                                                            : '#ffffff',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`additional-question-${currentQuestion.id}`}
                                                    value={
                                                        option.value
                                                    }
                                                    checked={
                                                        currentAnswer.answer ===
                                                        option.value
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateAnswer(
                                                            currentQuestion.id,
                                                            'answer',
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                                <strong>
                                                    {' '}
                                                    {
                                                        option.label
                                                    }
                                                </strong>

                                                <div
                                                    style={{
                                                        fontSize:
                                                            '12px',

                                                        color:
                                                            '#64748b',

                                                        marginTop:
                                                            '8px',

                                                        lineHeight:
                                                            '1.5',
                                                    }}
                                                >
                                                    {
                                                        option.description
                                                    }
                                                </div>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* =========================
                                EVIDENCE
                            ========================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '20px',
                                }}
                            >
                                <label
                                    style={{
                                        display:
                                            'block',

                                        fontWeight:
                                            '700',

                                        marginBottom:
                                            '8px',
                                    }}
                                >
                                    Evidence
                                </label>

                                <textarea
                                    value={
                                        currentAnswer.evidence ||
                                        ''
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateAnswer(
                                            currentQuestion.id,
                                            'evidence',
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder={
                                        currentQuestion.evidence_example ||
                                        'Masukkan bukti pendukung jika tersedia...'
                                    }
                                    rows={
                                        4
                                    }
                                    style={{
                                        width:
                                            '100%',

                                        boxSizing:
                                            'border-box',

                                        padding:
                                            '12px',

                                        border:
                                            '1px solid #cbd5e1',

                                        borderRadius:
                                            '8px',

                                        resize:
                                            'vertical',

                                        fontFamily:
                                            'Arial, sans-serif',
                                    }}
                                />
                            </div>

                            {/* =========================
                                NOTES
                            ========================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '20px',
                                }}
                            >
                                <label
                                    style={{
                                        display:
                                            'block',

                                        fontWeight:
                                            '700',

                                        marginBottom:
                                            '8px',
                                    }}
                                >
                                    Catatan
                                </label>

                                <textarea
                                    value={
                                        currentAnswer.notes ||
                                        ''
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateAnswer(
                                            currentQuestion.id,
                                            'notes',
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Catatan tambahan..."
                                    rows={
                                        3
                                    }
                                    style={{
                                        width:
                                            '100%',

                                        boxSizing:
                                            'border-box',

                                        padding:
                                            '12px',

                                        border:
                                            '1px solid #cbd5e1',

                                        borderRadius:
                                            '8px',

                                        resize:
                                            'vertical',

                                        fontFamily:
                                            'Arial, sans-serif',
                                    }}
                                />
                            </div>

                            {/* =========================
                                MESSAGE
                            ========================== */}

                            {message && (
                                <div
                                    style={{
                                        background:
                                            '#f0fdf4',

                                        border:
                                            '1px solid #bbf7d0',

                                        color:
                                            '#166534',

                                        padding:
                                            '11px 14px',

                                        borderRadius:
                                            '8px',

                                        marginBottom:
                                            '16px',
                                    }}
                                >
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div
                                    style={{
                                        background:
                                            '#fef2f2',

                                        border:
                                            '1px solid #fecaca',

                                        color:
                                            '#b91c1c',

                                        padding:
                                            '11px 14px',

                                        borderRadius:
                                            '8px',

                                        marginBottom:
                                            '16px',
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* =========================
                                BOTTOM NAVIGATION
                            ========================== */}

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    alignItems:
                                        'center',

                                    gap:
                                        '10px',

                                    flexWrap:
                                        'wrap',

                                    borderTop:
                                        '1px solid #e2e8f0',

                                    paddingTop:
                                        '20px',
                                }}
                            >
                                <button
                                    onClick={
                                        handlePrevious
                                    }
                                    disabled={
                                        isFirstQuestion ||
                                        saving
                                    }
                                    style={{
                                        padding:
                                            '11px 18px',

                                        border:
                                            '1px solid #cbd5e1',

                                        background:
                                            '#ffffff',

                                        borderRadius:
                                            '8px',

                                        cursor:
                                            isFirstQuestion ||
                                            saving
                                                ? 'not-allowed'
                                                : 'pointer',
                                    }}
                                >
                                    ← Sebelumnya
                                </button>

                                <div
                                    style={{
                                        display:
                                            'flex',

                                        gap:
                                            '10px',

                                        flexWrap:
                                            'wrap',
                                    }}
                                >
                                    <button
                                        onClick={
                                            handleSave
                                        }
                                        disabled={
                                            saving
                                        }
                                        style={{
                                            padding:
                                                '11px 18px',

                                            border:
                                                '1px solid #2563eb',

                                            background:
                                                '#ffffff',

                                            color:
                                                '#2563eb',

                                            borderRadius:
                                                '8px',

                                            cursor:
                                                'pointer',

                                            fontWeight:
                                                '600',
                                        }}
                                    >
                                        {saving
                                            ? 'Menyimpan...'
                                            : 'Simpan'}
                                    </button>

                                    <button
                                        onClick={
                                            handleNext
                                        }
                                        disabled={
                                            saving ||
                                            isLastQuestion
                                        }
                                        style={{
                                            padding:
                                                '11px 18px',

                                            border:
                                                'none',

                                            background:
                                                isLastQuestion
                                                    ? '#94a3b8'
                                                    : '#0f172a',

                                            color:
                                                '#ffffff',

                                            borderRadius:
                                                '8px',

                                            cursor:
                                                saving ||
                                                isLastQuestion
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                        }}
                                    >
                                        Berikutnya →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdditionalAssessment;