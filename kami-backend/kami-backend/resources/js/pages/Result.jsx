import React, {
    useEffect,
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
    },

    III: {
        name: 'Pengelolaan Risiko',
    },

    IV: {
        name: 'Kerangka Kerja Keamanan Informasi',
    },

    V: {
        name: 'Pengelolaan Aset',
    },

    VI: {
        name: 'Teknologi',
    },

    VII: {
        name: 'Perlindungan Data Pribadi',
    },

    VIII: {
        name: 'Suplemen',
    },
};

const CATEGORY_ORDER = [
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
];

const MATURITY_CATEGORY_ORDER = [
    'II',
    'III',
    'IV',
    'V',
    'VI',
];

function Result() {
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
        result,
        setResult,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    useEffect(() => {
        loadResult();
    }, [assessmentId]);

    const loadResult = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                assessmentResponse,
                resultResponse,
            ] = await Promise.all([
                api.get(
                    `/assessments/${assessmentId}`
                ),

                api.get(
                    `/assessments/${assessmentId}/result`
                ),
            ]);

            const assessmentData =
                assessmentResponse
                    ?.data
                    ?.data;

            setAssessment(
                assessmentData
            );

            const resultResponseData =
                resultResponse
                    ?.data
                    ?.data;

            if (!resultResponseData) {
                throw new Error(
                    'Data hasil assessment tidak ditemukan.'
                );
            }

            setResult(
                resultResponseData
            );
        } catch (err) {
            console.error(
                'Gagal memuat hasil assessment:',
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                'Hasil assessment gagal dimuat.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        color: '#64748b',
                    }}
                >
                    Memuat hasil assessment...
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <div
                    style={{
                        maxWidth: '700px',
                        margin: '60px auto',
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '30px',
                        border: '1px solid #fecaca',
                    }}
                >
                    <h2
                        style={{
                            marginTop: 0,
                            color: '#991b1b',
                        }}
                    >
                        Hasil Assessment Tidak Dapat Dimuat
                    </h2>

                    <p
                        style={{
                            color: '#64748b',
                            lineHeight: '1.6',
                        }}
                    >
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate('/')
                        }
                        style={
                            primaryButtonStyle
                        }
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </PageContainer>
        );
    }

    if (!result) {
        return (
            <PageContainer>
                <div
                    style={{
                        maxWidth: '700px',
                        margin: '60px auto',
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '30px',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <h2
                        style={{
                            marginTop: 0,
                        }}
                    >
                        Hasil Assessment Belum Tersedia
                    </h2>

                    <p
                        style={{
                            color: '#64748b',
                            lineHeight: '1.6',
                        }}
                    >
                        Silakan lakukan perhitungan
                        assessment terlebih dahulu.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/assessments/${assessmentId}/calculate`
                            )
                        }
                        style={
                            primaryButtonStyle
                        }
                    >
                        Kembali ke Perhitungan
                    </button>
                </div>
            </PageContainer>
        );
    }

    /*
     * ==========================================================
     * DATA HASIL
     * ==========================================================
     */

    const totalScore =
        Number(
            result.total_score
        ) || 0;

    const totalQuestions =
        Number(
            result.total_questions
        ) || 0;

    const totalAnswered =
        Number(
            result.total_answered
        ) || 0;

    const completionPercentage =
        Number(
            result.completion_percentage
        ) || 0;

    const seScore =
        Number(
            result.se?.score
        ) || 0;

    const seCategory =
        result.se?.category ||
        '-';

    const maturityLevel =
        result.maturity_level ||
        getMaturityLevel(
            result.maturity
        ) ||
        '- s/d -';

    const maturityDescription =
        result.maturity_description ||
        getMaturityDescription(
            result.maturity
        ) ||
        'Tingkat kematangan belum ditentukan.';

    const readinessStatus =
        result.readiness_status ||
        '-';

    const readinessDescription =
        result.readiness_description ||
        '';

    const areas =
        result.areas || {};

    const maturityAreas =
        result.maturity?.areas ||
        {};

    /*
     * Kategori VIII / Suplemen
     *
     * Kategori VIII ditampilkan terpisah dari
     * Kategori II–VII dalam bentuk persentase.
     * Nilainya tidak masuk ke Total Indeks KAMI
     * maupun tingkat kematangan keseluruhan.
     */
    const supplement =
        result.supplement || {};

    const supplementArea =
        areas.VIII || {};

    /*
     * Backend lama/current dapat mengembalikan
     * skor Kategori VIII melalui areas.VIII,
     * tetapi belum tentu mengirim object supplement.
     * Karena itu Result menggunakan supplement jika
     * tersedia dan fallback ke areas.VIII.
     */
    const supplementScore =
        Number(
            supplement.score
        ) ||
        Number(
            supplementArea.score
        ) ||
        0;

    const supplementTotalQuestions =
        Number(
            supplement.total_questions
        ) ||
        Number(
            supplementArea.total_questions
        ) ||
        0;

    const supplementMaxScore =
        Number(
            supplement.max_score
        ) ||
        (supplementTotalQuestions > 0
            ? supplementTotalQuestions * 3
            : 0);

    const supplementPercentage =
        supplement.percentage !==
            undefined &&
        supplement.percentage !==
            null
            ? Number(
                  supplement.percentage
              ) || 0
            : supplementMaxScore > 0
                ? Math.round(
                      (supplementScore /
                          supplementMaxScore) *
                          10000
                  ) / 100
                : 0;

    return (
        <PageContainer>
            <header
                style={{
                    background: '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                }}
            >
                <div
                    style={{
                        maxWidth: '1400px',
                        margin: '0 auto',
                        padding: '18px 24px',
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        alignItems: 'center',
                        gap: '20px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin:
                                    '0 0 6px 0',
                                fontSize: '26px',
                                color: '#0f172a',
                            }}
                        >
                            Hasil Assessment KAMI
                        </h1>

                        <div
                            style={{
                                color: '#64748b',
                                fontSize: '14px',
                            }}
                        >
                            {assessment?.school_name ||
                                'SD Teruna Bangsa'}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            onClick={() =>
                                navigate('/')
                            }
                            style={
                                secondaryButtonStyle
                            }
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    `/assessments/${assessmentId}/kami`
                                )
                            }
                            style={
                                secondaryButtonStyle
                            }
                        >
                            KAMI Assessment
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    `/assessments/${assessmentId}/additional`
                                )
                            }
                            style={
                                secondaryButtonStyle
                            }
                        >
                            Additional Assessment
                        </button>
                    </div>
                </div>
            </header>

            <main
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '28px 24px 50px',
                }}
            >
                {/* ==================================================
                    INFORMASI ASSESSMENT
                ================================================== */}

                <section
                    style={{
                        background: '#ffffff',
                        border:
                            '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '28px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            gap: '20px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: '14px',
                                    marginBottom: '8px',
                                }}
                            >
                                Assessment selesai dihitung
                            </div>

                            <h2
                                style={{
                                    margin:
                                        '0 0 10px 0',
                                    fontSize: '30px',
                                    fontWeight: '500',
                                    color: '#0f172a',
                                }}
                            >
                                {assessment?.school_name ||
                                    'SD Teruna Bangsa'}
                            </h2>

                            <div
                                style={{
                                    color: '#64748b',
                                }}
                            >
                                Responden:{' '}
                                {assessment?.respondent_name ||
                                    '-'}
                                {assessment?.respondent_role
                                    ? ` • ${assessment.respondent_role}`
                                    : ''}
                            </div>
                        </div>

                    </div>
                </section>

                {/* ==================================================
                    RINGKASAN HASIL
                ================================================== */}

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(4, minmax(0, 1fr))',
                        gap: '18px',
                        marginBottom: '24px',
                    }}
                >
                    <SummaryCard
                        title="Total Indeks KAMI"
                        value={formatNumber(
                            totalScore
                        )}
                        subtitle="Kategori II–VII"
                    />

                    <SummaryCard
                        title="Tingkat Kematangan"
                        value={
                            maturityLevel
                        }
                        subtitle="Hasil keseluruhan"
                    />

                    <SummaryCard
                        title="Kategori SE"
                        value={
                            seCategory
                        }
                        subtitle={`Skor SE: ${formatNumber(
                            seScore
                        )}`}
                    />

                    <SummaryCard
                        title="Kelengkapan"
                        value={`${formatNumber(
                            completionPercentage
                        )}%`}
                        subtitle={`${totalAnswered} / ${totalQuestions} pertanyaan`}
                    />
                </section>

                {/* ==================================================
                    INFORMASI PENILAIAN
                ================================================== */}

                <section
                    style={{
                        background: '#eff6ff',
                        border:
                            '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        color: '#1e3a8a',
                        lineHeight: '1.7',
                    }}
                >
                    <div
                        style={{
                            fontWeight: '700',
                            marginBottom: '8px',
                        }}
                    >
                        Informasi Penilaian
                    </div>

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
                        perhitungan assessment.
                    </p>

                    <p
                        style={{
                            margin:
                                '0 0 8px 0',
                        }}
                    >
                        <strong>
                            21 pertanyaan tambahan
                        </strong>{' '}
                        hanya digunakan sebagai
                        data pendukung dan
                        <strong>
                            {' '}tidak masuk ke
                            penilaian KAMI
                        </strong>.
                    </p>

                    <p
                        style={{
                            margin: 0,
                        }}
                    >
                        Kategori VIII merupakan
                        suplemen dan tidak masuk
                        ke Total Indeks KAMI.
                        Hasil Kategori VIII ditampilkan
                        secara terpisah dalam bentuk
                        persentase penerapan.
                    </p>
                </section>

                {/* ==================================================
                    KONTEN UTAMA
                ================================================== */}

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'minmax(0, 1.7fr) minmax(320px, 0.8fr)',
                        gap: '24px',
                        alignItems: 'start',
                    }}
                >
                    {/* ==============================================
                        SKOR KATEGORI
                    ============================================== */}

                    <div
                        style={{
                            background: '#ffffff',
                            border:
                                '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '24px',
                        }}
                    >
                        <h2
                            style={{
                                margin:
                                    '0 0 6px 0',
                                fontSize: '24px',
                                color: '#0f172a',
                            }}
                        >
                            Skor Setiap Kategori
                        </h2>

                        <p
                            style={{
                                margin:
                                    '0 0 20px 0',
                                color: '#64748b',
                            }}
                        >
                            Ringkasan hasil
                            perhitungan setiap area
                            assessment.
                        </p>

                        {CATEGORY_ORDER.map(
                            (category) => {
                                const area =
                                    areas[
                                        category
                                    ] || {};

                                const score =
                                    Number(
                                        area.score
                                    ) || 0;

                                const answered =
                                    Number(
                                        area.answered
                                    ) || 0;

                                const total =
                                    Number(
                                        area.total_questions
                                    ) || 0;

                                const percentage =
                                    getAreaPercentage(
                                        area
                                    );

                                return (
                                    <CategoryCard
                                        key={
                                            category
                                        }
                                        category={
                                            category
                                        }
                                        score={
                                            score
                                        }
                                        answered={
                                            answered
                                        }
                                        total={
                                            total
                                        }
                                        percentage={
                                            percentage
                                        }
                                    />
                                );
                            }
                        )}
                    </div>

                    {/* ==============================================
                        KATEGORI VIII / SUPLEMEN
                    ============================================== */}

                    <div
                        style={{
                            background: '#ffffff',
                            border:
                                '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '24px',
                            marginTop: '20px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent:
                                    'space-between',
                                alignItems: 'flex-start',
                                gap: '20px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin:
                                            '0 0 6px 0',
                                        fontSize: '24px',
                                        color: '#0f172a',
                                    }}
                                >
                                    Kategori VIII — Suplemen
                                </h2>

                                
                            </div>

                            <div
                                style={{
                                    background: '#eff6ff',
                                    border:
                                        '1px solid #bfdbfe',
                                    color: '#1d4ed8',
                                    borderRadius: '12px',
                                    padding:
                                        '18px 24px',
                                    minWidth: '150px',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '13px',
                                        marginBottom: '5px',
                                    }}
                                >
                                    Persentase Penerapan
                                </div>

                                <div
                                    style={{
                                        fontSize: '30px',
                                        fontWeight: '700',
                                    }}
                                >
                                    {formatNumber(
                                        supplementPercentage
                                    )}%
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(3, minmax(0, 1fr))',
                                gap: '12px',
                                marginTop: '8px',
                            }}
                        >
                            <SupplementValue
                                title="Skor Suplemen"
                                value={formatNumber(
                                    supplementScore
                                )}
                            />

                            <SupplementValue
                                title="Skor Maksimum"
                                value={formatNumber(
                                    supplementMaxScore
                                )}
                            />

                            <SupplementValue
                                title="Jumlah Pertanyaan"
                                value={formatNumber(
                                    supplementTotalQuestions
                                )}
                            />
                        </div>

                        <div
                            style={{
                                marginTop: '16px',
                                padding: '14px 16px',
                                background: '#f8fafc',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius: '10px',
                                color: '#64748b',
                                fontSize: '13px',
                                lineHeight: '1.6',
                            }}
                        >
                            Kategori VIII merupakan suplemen.
                            Persentasenya hanya digunakan untuk
                            menggambarkan tingkat penerapan
                            suplemen dan tidak memengaruhi
                            Total Indeks KAMI, tingkat kematangan,
                            maupun Kategori SE.
                        </div>
                    </div>

                    {/* ==============================================
                        SIDEBAR
                    ============================================== */}

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >
                        {/* ==========================================
                            MATURITY OVERALL
                        ========================================== */}

                        <div
                            style={{
                                background: '#ffffff',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '24px',
                            }}
                        >
                            <h2
                                style={{
                                    margin:
                                        '0 0 20px 0',
                                    fontSize: '23px',
                                    color: '#0f172a',
                                }}
                            >
                                Tingkat Kematangan
                            </h2>

                            <div
                                style={{
                                    background:
                                        '#eff6ff',
                                    border:
                                        '1px solid #bfdbfe',
                                    borderRadius: '12px',
                                    padding: '26px',
                                    textAlign: 'center',
                                    marginBottom: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '14px',
                                        marginBottom:
                                            '8px',
                                    }}
                                >
                                    Hasil Keseluruhan
                                </div>

                                <div
                                    style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1d4ed8',
                                    }}
                                >
                                    {maturityLevel}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(2, minmax(0, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MaturityValue
                                    title="Minimum"
                                    value={getMaturityMinimum(
                                        result
                                    )}
                                />

                                <MaturityValue
                                    title="Maksimum"
                                    value={getMaturityMaximum(
                                        result
                                    )}
                                />
                            </div>
                        </div>

                        {/* ==========================================
                            SE
                        ========================================== */}

                        <div
                            style={{
                                background: '#ffffff',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '24px',
                            }}
                        >
                            <h2
                                style={{
                                    margin:
                                        '0 0 18px 0',
                                    fontSize: '21px',
                                }}
                            >
                                Kategori Sistem Elektronik
                            </h2>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems: 'center',
                                    padding: '18px',
                                    background:
                                        '#f8fafc',
                                    borderRadius: '10px',
                                    border:
                                        '1px solid #e2e8f0',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize:
                                                '13px',
                                            color:
                                                '#64748b',
                                        }}
                                    >
                                        Kategori SE
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '26px',
                                            fontWeight:
                                                '700',
                                            marginTop:
                                                '4px',
                                        }}
                                    >
                                        {seCategory}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        textAlign:
                                            'right',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                '13px',
                                            color:
                                                '#64748b',
                                        }}
                                    >
                                        Skor
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '22px',
                                            fontWeight:
                                                '600',
                                        }}
                                    >
                                        {formatNumber(
                                            seScore
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ==========================================
                            READINESS
                        ========================================== */}

                        {readinessStatus !== '-' && (
                            <div
                                style={{
                                    background:
                                        '#ffffff',
                                    border:
                                        '1px solid #e2e8f0',
                                    borderRadius:
                                        '14px',
                                    padding: '24px',
                                }}
                            >
                                <h2
                                    style={{
                                        margin:
                                            '0 0 18px 0',
                                        fontSize:
                                            '21px',
                                    }}
                                >
                                    Readiness KAMI
                                </h2>

                                <div
                                    style={{
                                        background:
                                            '#f8fafc',
                                        border:
                                            '1px solid #e2e8f0',
                                        borderRadius:
                                            '10px',
                                        padding:
                                            '18px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight:
                                                '700',
                                            fontSize:
                                                '18px',
                                            marginBottom:
                                                '8px',
                                        }}
                                    >
                                        {
                                            readinessStatus
                                        }
                                    </div>

                                    {readinessDescription && (
                                        <div
                                            style={{
                                                color:
                                                    '#64748b',
                                                lineHeight:
                                                    '1.6',
                                                fontSize:
                                                    '14px',
                                            }}
                                        >
                                            {
                                                readinessDescription
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ==================================================
                    MATURITY PER AREA
                ================================================== */}

                <section
                    style={{
                        background: '#ffffff',
                        border:
                            '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '24px',
                        marginTop: '24px',
                    }}
                >
                    <h2
                        style={{
                            margin:
                                '0 0 6px 0',
                            fontSize: '23px',
                            color: '#0f172a',
                        }}
                    >
                        Tingkat Kematangan Setiap Area
                    </h2>

                    <p
                        style={{
                            margin:
                                '0 0 20px 0',
                            color: '#64748b',
                            lineHeight: '1.6',
                        }}
                    >
                        Tingkat kematangan area II–VI
                        digunakan sebagai dasar
                        penentuan rentang tingkat
                        kematangan keseluruhan.
                    </p>

                    <div
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse:
                                    'collapse',
                                minWidth: '700px',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={
                                            tableHeaderStyle
                                        }
                                    >
                                        Area
                                    </th>

                                    <th
                                        style={
                                            tableHeaderStyle
                                        }
                                    >
                                        Skor Area
                                    </th>

                                    <th
                                        style={
                                            tableHeaderStyle
                                        }
                                    >
                                        Tingkat Kematangan
                                    </th>

                                    <th
                                        style={
                                            tableHeaderStyle
                                        }
                                    >
                                        Keterangan
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {MATURITY_CATEGORY_ORDER.map(
                                    (category) => {
                                        const area =
                                            maturityAreas[
                                                category
                                            ] ||
                                            {};

                                        const areaScore =
                                            Number(
                                                area.area_score
                                            );

                                        const level =
                                            area.level ||
                                            '-';

                                        const description =
                                            area.description ||
                                            '-';

                                        return (
                                            <tr
                                                key={
                                                    category
                                                }
                                            >
                                                <td
                                                    style={
                                                        tableCellStyle
                                                    }
                                                >
                                                    <strong>
                                                        Kategori{' '}
                                                        {
                                                            category
                                                        }
                                                    </strong>

                                                    <div
                                                        style={{
                                                            marginTop:
                                                                '4px',
                                                            color:
                                                                '#64748b',
                                                            fontSize:
                                                                '13px',
                                                        }}
                                                    >
                                                        {
                                                            CATEGORY_INFO[
                                                                category
                                                            ]?.name
                                                        }
                                                    </div>
                                                </td>

                                                <td
                                                    style={
                                                        tableCellStyle
                                                    }
                                                >
                                                    {formatNumber(
                                                        Number.isNaN(
                                                            areaScore
                                                        )
                                                            ? 0
                                                            : areaScore
                                                    )}
                                                </td>

                                                <td
                                                    style={
                                                        tableCellStyle
                                                    }
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                'inline-block',
                                                            background:
                                                                '#eff6ff',
                                                            color:
                                                                '#1d4ed8',
                                                            border:
                                                                '1px solid #bfdbfe',
                                                            borderRadius:
                                                                '8px',
                                                            padding:
                                                                '6px 12px',
                                                            fontWeight:
                                                                '700',
                                                        }}
                                                    >
                                                        {
                                                            level
                                                        }
                                                    </span>
                                                </td>

                                                <td
                                                    style={{
                                                        ...tableCellStyle,
                                                        color:
                                                            '#64748b',
                                                    }}
                                                >
                                                    {
                                                        description
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ==================================================
                    DESKRIPSI MATURITY
                ================================================== */}

                <section
                    style={{
                        background: '#ffffff',
                        border:
                            '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '24px',
                        marginTop: '24px',
                    }}
                >
                    <h2
                        style={{
                            margin:
                                '0 0 12px 0',
                            fontSize: '22px',
                        }}
                    >
                        Deskripsi Tingkat Kematangan
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: '#475569',
                            lineHeight: '1.8',
                        }}
                    >
                        {maturityDescription}
                    </p>
                </section>

                {/* ==================================================
                    ACTION
                ================================================== */}

                <section
                    style={{
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginTop: '24px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            onClick={() =>
                                navigate(
                                    `/assessments/${assessmentId}/kami`
                                )
                            }
                            style={
                                secondaryButtonStyle
                            }
                        >
                            Kembali ke KAMI
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    `/assessments/${assessmentId}/additional-result`
                                )
                            }
                            style={
                                secondaryButtonStyle
                            }
                        >
                            Lihat Tambahan
                        </button>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                `/assessments/${assessmentId}/calculate`
                            )
                        }
                        style={
                            primaryButtonStyle
                        }
                    >
                        Hitung Ulang
                    </button>
                </section>
            </main>
        </PageContainer>
    );
}

/*
 * ==============================================================
 * PAGE CONTAINER
 * ==============================================================
 */

function PageContainer({
    children,
}) {
    return (
        <div className="kami-result-page"
            style={{
                minHeight: '100vh',
                background: '#f8fafc',
                fontFamily:
                    'Arial, sans-serif',
                color: '#1e293b',
            }}
        >
            {children}
        </div>
    );
}

/*
 * ==============================================================
 * SUMMARY CARD
 * ==============================================================
 */

function SummaryCard({
    title,
    value,
    subtitle,
}) {
    return (
        <div
            style={{
                background: '#ffffff',
                border:
                    '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '22px',
                minHeight: '120px',
            }}
        >
            <div
                style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '14px',
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: '27px',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginBottom: '8px',
                }}
            >
                {value}
            </div>

            <div
                style={{
                    color: '#94a3b8',
                    fontSize: '13px',
                }}
            >
                {subtitle}
            </div>
        </div>
    );
}

/*
 * ==============================================================
 * CATEGORY CARD
 * ==============================================================
 */

function CategoryCard({
    category,
    score,
    answered,
    total,
    percentage,
}) {
    const info =
        CATEGORY_INFO[
            category
        ];

    return (
        <div
            style={{
                border:
                    '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '12px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: 'flex-start',
                    gap: '15px',
                }}
            >
                <div>
                    <div
                        style={{
                            fontWeight: '700',
                            fontSize: '17px',
                        }}
                    >
                        Kategori {category}
                    </div>

                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '14px',
                            marginTop: '5px',
                        }}
                    >
                        {info?.name ||
                            'Kategori Assessment'}
                    </div>
                </div>

                <div
                    style={{
                        textAlign: 'right',
                    }}
                >
                    <div
                        style={{
                            fontSize: '23px',
                            fontWeight: '700',
                        }}
                    >
                        {formatNumber(
                            score
                        )}
                    </div>

                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '13px',
                        }}
                    >
                        {answered} / {total}{' '}
                        terjawab
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: '15px',
                    height: '8px',
                    background: '#e2e8f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${Math.min(
                            Math.max(
                                percentage,
                                0
                            ),
                            100
                        )}%`,
                        height: '100%',
                        background: '#2563eb',
                        borderRadius: '999px',
                    }}
                />
            </div>

            <div
                style={{
                    marginTop: '7px',
                    textAlign: 'right',
                    color: '#64748b',
                    fontSize: '12px',
                }}
            >
                {formatNumber(
                    percentage
                )}
                %
            </div>
        </div>
    );
}

/*
 * ==============================================================
 * SUPPLEMENT VALUE
 * ==============================================================
 */

function SupplementValue({
    title,
    value,
}) {
    return (
        <div
            style={{
                border:
                    '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '15px',
            }}
        >
            <div
                style={{
                    color: '#64748b',
                    fontSize: '13px',
                    marginBottom: '5px',
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontWeight: '700',
                    fontSize: '19px',
                }}
            >
                {value}
            </div>
        </div>
    );
}

/*
 * ==============================================================
 * MATURITY VALUE
 * ==============================================================
 */

function MaturityValue({
    title,
    value,
}) {
    return (
        <div
            style={{
                border:
                    '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '15px',
            }}
        >
            <div
                style={{
                    color: '#64748b',
                    fontSize: '13px',
                    marginBottom: '5px',
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontWeight: '700',
                    fontSize: '19px',
                }}
            >
                {value}
            </div>
        </div>
    );
}

/*
 * ==============================================================
 * HELPER
 * ==============================================================
 */

function formatNumber(
    value
) {
    const number =
        Number(value);

    if (
        Number.isNaN(number)
    ) {
        return '0';
    }

    return number
        .toLocaleString(
            'id-ID',
            {
                maximumFractionDigits: 2,
            }
        );
}

function getAreaPercentage(
    area
) {
    if (
        area?.percentage !==
        undefined &&
        area?.percentage !==
        null
    ) {
        return Number(
            area.percentage
        ) || 0;
    }

    const answered =
        Number(
            area?.answered
        ) || 0;

    const total =
        Number(
            area?.total_questions
        ) || 0;

    if (total <= 0) {
        return 0;
    }

    return (
        (answered / total) *
        100
    );
}

function getMaturityLevel(
    maturity
) {
    const overall =
        maturity?.overall;

    if (
        !overall ||
        !overall.minimum ||
        !overall.maximum
    ) {
        return null;
    }

    return `${overall.minimum} s/d ${overall.maximum}`;
}

function getMaturityMinimum(
    result
) {
    const minimum =
        result?.maturity
            ?.overall
            ?.minimum;

    if (minimum) {
        return minimum;
    }

    const level =
        result?.maturity_level;

    if (level) {
        const match =
            level.match(
                /^(.+?)\s+s\/d\s+(.+)$/
            );

        if (match) {
            return match[1];
        }
    }

    return '-';
}

function getMaturityMaximum(
    result
) {
    const maximum =
        result?.maturity
            ?.overall
            ?.maximum;

    if (maximum) {
        return maximum;
    }

    const level =
        result?.maturity_level;

    if (level) {
        const match =
            level.match(
                /^(.+?)\s+s\/d\s+(.+)$/
            );

        if (match) {
            return match[2];
        }
    }

    return '-';
}

function getMaturityDescription(
    maturity
) {
    return (
        maturity?.overall
            ?.description ||
        null
    );
}

/*
 * ==============================================================
 * BUTTON STYLES
 * ==============================================================
 */

const primaryButtonStyle = {
    padding: '12px 20px',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
};

const secondaryButtonStyle = {
    padding: '11px 17px',
    border:
        '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
};

const tableHeaderStyle = {
    textAlign: 'left',
    padding: '14px 16px',
    background: '#f8fafc',
    borderBottom:
        '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '700',
};

const tableCellStyle = {
    padding: '16px',
    borderBottom:
        '1px solid #e2e8f0',
    verticalAlign: 'top',
    fontSize: '14px',
};

export default Result;