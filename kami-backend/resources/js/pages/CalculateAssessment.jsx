import React, {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import api from '../services/api';

function CalculateAssessment() {
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
        additionalProgress,
        setAdditionalProgress,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        calculating,
        setCalculating,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    useEffect(() => {
        loadData();
    }, [assessmentId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                assessmentResponse,
                additionalResponse,
            ] = await Promise.all([
                api.get(
                    `/assessments/${assessmentId}`
                ),

                api.get(
                    `/assessments/${assessmentId}/additional-answers`
                ),
            ]);

            setAssessment(
                assessmentResponse.data.data
            );

            setAdditionalProgress(
                additionalResponse.data.data
            );
        } catch (err) {
            console.error(
                'Gagal memuat data assessment:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Data assessment gagal dimuat.'
            );
        } finally {
            setLoading(false);
        }
    };

    const kamiAnswers =
        assessment?.answers || [];

    const kamiTotal =
        211;

    const kamiAnswered =
        kamiAnswers.filter(
            (answer) =>
                answer.answer !== null &&
                answer.answer !== ''
        ).length;

    const kamiPercentage =
        kamiTotal > 0
            ? Math.round(
                (kamiAnswered /
                    kamiTotal) *
                    100
            )
            : 0;

    const additionalTotal =
        Number(
            additionalProgress
                ?.total_questions
        ) || 21;

    const additionalAnswered =
        Number(
            additionalProgress
                ?.answered_questions
        ) || 0;

    const additionalPercentage =
        additionalTotal > 0
            ? Math.round(
                (additionalAnswered /
                    additionalTotal) *
                    100
            )
            : 0;

    const kamiComplete =
        kamiAnswered >= kamiTotal;

    const additionalComplete =
        additionalAnswered >=
        additionalTotal;

    const handleCalculate = async () => {
        try {
            setCalculating(true);
            setError('');

            const response =
                await api.post(
                    `/assessments/${assessmentId}/calculate`
                );

            if (
                response.data &&
                response.data.success
            ) {
                navigate(
                    `/assessments/${assessmentId}/result`
                );

                return;
            }

            setError(
                response.data?.message ||
                'Perhitungan assessment gagal.'
            );
        } catch (err) {
            console.error(
                'Gagal menghitung assessment:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Perhitungan assessment gagal dilakukan.'
            );
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    fontFamily:
                        'Arial, sans-serif',
                }}
            >
                <div
                    style={{
                        color:
                            '#475569',
                        fontSize:
                            '16px',
                    }}
                >
                    Memuat data assessment...
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background:
                        '#f8fafc',
                    padding:
                        '40px 24px',
                    fontFamily:
                        'Arial, sans-serif',
                }}
            >
                <div
                    style={{
                        maxWidth:
                            '700px',
                        margin:
                            '0 auto',
                        background:
                            '#ffffff',
                        borderRadius:
                            '12px',
                        padding:
                            '30px',
                        boxShadow:
                            '0 4px 15px rgba(0,0,0,0.08)',
                    }}
                >
                    <h2>
                        Assessment tidak ditemukan
                    </h2>

                    <p
                        style={{
                            color:
                                '#64748b',
                        }}
                    >
                        {error ||
                            'Data assessment tidak tersedia.'}
                    </p>

                    <button
                        onClick={() =>
                            navigate('/')
                        }
                        style={{
                            padding:
                                '10px 18px',
                            border:
                                'none',
                            borderRadius:
                                '8px',
                            background:
                                '#2563eb',
                            color:
                                '#ffffff',
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

    return (
        <div className="kami-calculation-page"
            style={{
                minHeight: '100vh',
                background:
                    '#f8fafc',
                fontFamily:
                    'Arial, sans-serif',
                color:
                    '#1e293b',
            }}
        >
            <div
                style={{
                    maxWidth:
                        '1100px',
                    margin:
                        '0 auto',
                    padding:
                        '40px 24px',
                }}
            >
                <button
                    onClick={() =>
                        navigate('/')
                    }
                    style={{
                        background:
                            'transparent',
                        border:
                            'none',
                        cursor:
                            'pointer',
                        fontSize:
                            '14px',
                        color:
                            '#475569',
                        marginBottom:
                            '20px',
                        padding: 0,
                    }}
                >
                    ← Dashboard
                </button>

                <div
                    style={{
                        background:
                            '#ffffff',
                        borderRadius:
                            '16px',
                        padding:
                            '32px',
                        boxShadow:
                            '0 4px 20px rgba(0,0,0,0.06)',
                    }}
                >
                    <div
                        style={{
                            marginBottom:
                                '30px',
                        }}
                    >
                        <h1
                            style={{
                                margin:
                                    '0 0 8px 0',
                                fontSize:
                                    '28px',
                            }}
                        >
                            Perhitungan Assessment
                        </h1>

                        <p
                            style={{
                                margin: 0,
                                color:
                                    '#64748b',
                                lineHeight:
                                    '1.6',
                            }}
                        >
                            Periksa kelengkapan
                            assessment sebelum
                            melakukan perhitungan
                            hasil.
                        </p>
                    </div>

                    <div
                        style={{
                            background:
                                '#f8fafc',
                            border:
                                '1px solid #e2e8f0',
                            borderRadius:
                                '12px',
                            padding:
                                '20px',
                            marginBottom:
                                '24px',
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    '13px',
                                color:
                                    '#64748b',
                                marginBottom:
                                    '6px',
                            }}
                        >
                            Assessment
                        </div>

                        <div
                            style={{
                                fontSize:
                                    '20px',
                                fontWeight:
                                    '600',
                            }}
                        >
                            {
                                assessment.school_name
                            }
                        </div>

                        <div
                            style={{
                                marginTop:
                                    '8px',
                                color:
                                    '#64748b',
                            }}
                        >
                            Responden:{' '}
                            {
                                assessment.respondent_name
                            }
                        </div>

                        {assessment.respondent_role && (
                            <div
                                style={{
                                    marginTop:
                                        '4px',
                                    color:
                                        '#64748b',
                                }}
                            >
                                Jabatan:{' '}
                                {
                                    assessment.respondent_role
                                }
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display:
                                'grid',
                            gridTemplateColumns:
                                'repeat(2, minmax(0, 1fr))',
                            gap:
                                '20px',
                            marginBottom:
                                '24px',
                        }}
                    >
                        <ProgressCard
                            title="Assessment KAMI"
                            subtitle="Dasar penilaian KAMI"
                            answered={
                                kamiAnswered
                            }
                            total={
                                kamiTotal
                            }
                            percentage={
                                kamiPercentage
                            }
                            complete={
                                kamiComplete
                            }
                        />

                        <ProgressCard
                            title="Assessment Tambahan"
                            subtitle="Data pendukung, tidak dinilai"
                            answered={
                                additionalAnswered
                            }
                            total={
                                additionalTotal
                            }
                            percentage={
                                additionalPercentage
                            }
                            complete={
                                additionalComplete
                            }
                        />
                    </div>

                    <div
                        style={{
                            background:
                                '#eff6ff',
                            border:
                                '1px solid #bfdbfe',
                            borderRadius:
                                '12px',
                            padding:
                                '20px',
                            marginBottom:
                                '24px',
                        }}
                    >
                        <div
                            style={{
                                fontWeight:
                                    '700',
                                marginBottom:
                                    '8px',
                                color:
                                    '#1e40af',
                            }}
                        >
                            Informasi Penilaian
                        </div>

                        <div
                            style={{
                                color:
                                    '#1e3a8a',
                                lineHeight:
                                    '1.7',
                                fontSize:
                                    '14px',
                            }}
                        >
                            <p
                                style={{
                                    margin:
                                        '0 0 8px 0',
                                }}
                            >
                                <strong>
                                    211 pertanyaan KAMI
                                </strong>{' '}
                                merupakan dasar
                                perhitungan skor
                                assessment.
                            </p>

                            <p
                                style={{
                                    margin:
                                        '0 0 8px 0',
                                }}
                            >
                                <strong>
                                    21 pertanyaan
                                    tambahan
                                </strong>{' '}
                                hanya digunakan
                                sebagai data
                                pendukung dan{' '}
                                <strong>
                                    tidak masuk ke
                                    penilaian KAMI
                                </strong>.
                            </p>

                            <p
                                style={{
                                    margin: 0,
                                }}
                            >
                                Pertanyaan tambahan
                                tidak menambah,
                                mengurangi, atau
                                memengaruhi skor,
                                tingkat kematangan,
                                kategori SE, maupun
                                readiness KAMI.
                            </p>
                        </div>
                    </div>

                    {!kamiComplete && (
                        <div
                            style={{
                                background:
                                    '#fff7ed',
                                border:
                                    '1px solid #fed7aa',
                                color:
                                    '#9a3412',
                                borderRadius:
                                    '10px',
                                padding:
                                    '14px 16px',
                                marginBottom:
                                    '20px',
                                lineHeight:
                                    '1.6',
                            }}
                        >
                            Assessment KAMI belum
                            lengkap. Masih terdapat{' '}
                            <strong>
                                {
                                    kamiTotal -
                                    kamiAnswered
                                }{' '}
                                pertanyaan
                            </strong>{' '}
                            yang belum dijawab.
                        </div>
                    )}

                    {!additionalComplete && (
                        <div
                            style={{
                                background:
                                    '#fff7ed',
                                border:
                                    '1px solid #fed7aa',
                                color:
                                    '#9a3412',
                                borderRadius:
                                    '10px',
                                padding:
                                    '14px 16px',
                                marginBottom:
                                    '20px',
                                lineHeight:
                                    '1.6',
                            }}
                        >
                            Assessment tambahan
                            belum lengkap. Masih
                            terdapat{' '}
                            <strong>
                                {
                                    additionalTotal -
                                    additionalAnswered
                                }{' '}
                                pertanyaan
                            </strong>{' '}
                            yang belum dijawab.
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
                                borderRadius:
                                    '8px',
                                padding:
                                    '12px 16px',
                                marginBottom:
                                    '20px',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div
                        style={{
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            gap:
                                '12px',
                            flexWrap:
                                'wrap',
                        }}
                    >
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
                                onClick={() =>
                                    navigate(
                                        `/assessments/${assessmentId}/kami`
                                    )
                                }
                                style={{
                                    padding:
                                        '12px 18px',
                                    border:
                                        '1px solid #cbd5e1',
                                    background:
                                        '#ffffff',
                                    borderRadius:
                                        '8px',
                                    cursor:
                                        'pointer',
                                    fontWeight:
                                        '500',
                                }}
                            >
                                Kembali ke KAMI
                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/assessments/${assessmentId}/additional`
                                    )
                                }
                                style={{
                                    padding:
                                        '12px 18px',
                                    border:
                                        '1px solid #cbd5e1',
                                    background:
                                        '#ffffff',
                                    borderRadius:
                                        '8px',
                                    cursor:
                                        'pointer',
                                    fontWeight:
                                        '500',
                                }}
                            >
                                Kembali ke
                                Tambahan
                            </button>
                        </div>

                        <button
                            onClick={
                                handleCalculate
                            }
                            disabled={
                                calculating
                            }
                            style={{
                                padding:
                                    '13px 24px',
                                border:
                                    'none',
                                background:
                                    calculating
                                        ? '#94a3b8'
                                        : '#2563eb',
                                color:
                                    '#ffffff',
                                borderRadius:
                                    '8px',
                                cursor:
                                    calculating
                                        ? 'not-allowed'
                                        : 'pointer',
                                fontWeight:
                                    '600',
                                fontSize:
                                    '15px',
                            }}
                        >
                            {calculating
                                ? 'Menghitung...'
                                : 'Hitung Hasil Assessment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressCard({
    title,
    subtitle,
    answered,
    total,
    percentage,
    complete,
}) {
    return (
        <div
            style={{
                border:
                    '1px solid #e2e8f0',
                borderRadius:
                    '12px',
                padding:
                    '22px',
            }}
        >
            <div
                style={{
                    display:
                        'flex',
                    justifyContent:
                        'space-between',
                    alignItems:
                        'flex-start',
                    gap:
                        '10px',
                    marginBottom:
                        '14px',
                }}
            >
                <div>
                    <strong
                        style={{
                            display:
                                'block',
                            fontSize:
                                '16px',
                            marginBottom:
                                '5px',
                        }}
                    >
                        {title}
                    </strong>

                    <span
                        style={{
                            fontSize:
                                '12px',
                            color:
                                '#64748b',
                        }}
                    >
                        {subtitle}
                    </span>
                </div>

                <span
                    style={{
                        fontSize:
                            '12px',
                        fontWeight:
                            '600',
                        padding:
                            '5px 9px',
                        borderRadius:
                            '999px',
                        background:
                            complete
                                ? '#dcfce7'
                                : '#fef3c7',
                        color:
                            complete
                                ? '#166534'
                                : '#92400e',
                        whiteSpace:
                            'nowrap',
                    }}
                >
                    {complete
                        ? 'Lengkap'
                        : 'Belum Lengkap'}
                </span>
            </div>

            <div
                style={{
                    fontSize:
                        '26px',
                    fontWeight:
                        '700',
                    marginBottom:
                        '8px',
                }}
            >
                {answered}

                <span
                    style={{
                        fontSize:
                            '15px',
                        fontWeight:
                            '400',
                        color:
                            '#64748b',
                    }}
                >
                    {' '}
                    / {total}
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
                            `${percentage}%`,
                        height:
                            '100%',
                        background:
                            '#2563eb',
                        borderRadius:
                            '999px',
                        transition:
                            'width 0.3s ease',
                    }}
                />
            </div>

            <div
                style={{
                    marginTop:
                        '8px',
                    fontSize:
                        '13px',
                    color:
                        '#64748b',
                }}
            >
                {percentage}% selesai
            </div>
        </div>
    );
}

export default CalculateAssessment;