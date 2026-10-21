import React, {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import api from '../services/api';

function AdditionalResult() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAdditionalResult();
    }, [assessmentId]);

    const loadAdditionalResult = async () => {
        try {
            setLoading(true);
            setError('');

            const [assessmentResponse, answersResponse] =
                await Promise.all([
                    api.get(`/assessments/${assessmentId}`),
                    api.get(
                        `/assessments/${assessmentId}/additional-answers`
                    ),
                ]);

            const assessmentData =
                assessmentResponse?.data?.data || null;

            const additionalData =
                answersResponse?.data?.data || {};

            setAssessment(assessmentData);

            const answerData = Array.isArray(additionalData)
                ? additionalData
                : additionalData.answers ||
                  additionalData.data ||
                  [];

            setAnswers(answerData);
        } catch (err) {
            console.error(
                'Gagal memuat hasil assessment tambahan:',
                err
            );

            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Hasil assessment tambahan gagal dimuat.'
            );
        } finally {
            setLoading(false);
        }
    };

    const assessmentAdditionalAnswers =
        assessment?.additional_answers ||
        assessment?.additionalAnswers ||
        [];

    const displayAnswers =
        answers.length > 0
            ? answers
            : assessmentAdditionalAnswers;

    return (
        <PageContainer>
            <header style={headerStyle}>
                <div style={containerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            Hasil Assessment Tambahan
                        </h1>
                        <p style={subtitleStyle}>
                            Daftar pertanyaan dan jawaban Assessment Tambahan.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/assessments/${assessmentId}/result`
                            )
                        }
                        style={secondaryButtonStyle}
                    >
                        Kembali ke Hasil
                    </button>
                </div>
            </header>

            <main style={containerStyle}>
                {loading && (
                    <div style={messageCardStyle}>
                        Memuat hasil assessment tambahan...
                    </div>
                )}

                {!loading && error && (
                    <div style={errorCardStyle}>
                        <h2 style={errorTitleStyle}>
                            Hasil Assessment Tambahan Tidak Dapat Dimuat
                        </h2>
                        <p style={paragraphStyle}>{error}</p>
                        <button
                            type="button"
                            onClick={loadAdditionalResult}
                            style={primaryButtonStyle}
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <section style={infoCardStyle}>
                            <h2 style={sectionTitleStyle}>
                                Informasi Assessment
                            </h2>

                            <div style={infoGridStyle}>
                                <InfoItem
                                    label="Sekolah"
                                    value={
                                        assessment?.school_name || '-'
                                    }
                                />
                                <InfoItem
                                    label="Responden"
                                    value={
                                        assessment?.respondent_name || '-'
                                    }
                                />
                                <InfoItem
                                    label="Periode"
                                    value={
                                        assessment?.assessment_period || '-'
                                    }
                                />
                                <InfoItem
                                    label="Jumlah Jawaban"
                                    value={`${displayAnswers.filter(
                                        (item) =>
                                            item?.answer !== null &&
                                            item?.answer !== '' &&
                                            item?.answer !== undefined
                                    ).length}`}
                                />
                            </div>
                        </section>

                        <section style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <div>
                                    <h2 style={sectionTitleStyle}>
                                        Pertanyaan & Jawaban
                                    </h2>
                                    <p style={smallTextStyle}>
                                        Assessment Tambahan hanya ditampilkan sebagai
                                        data pendukung dan tidak memengaruhi hasil
                                        perhitungan KAMI.
                                    </p>
                                </div>
                            </div>

                            {displayAnswers.length === 0 ? (
                                <div style={emptyStyle}>
                                    Belum ada jawaban Assessment Tambahan.
                                </div>
                            ) : (
                                <div style={listStyle}>
                                    {displayAnswers.map((item, index) => {
                                        const question =
                                            item?.question ||
                                            item?.additional_question ||
                                            {};

                                        const questionNumber =
                                            question.question_number ||
                                            item.question_number ||
                                            index + 1;

                                        const questionText =
                                            question.question ||
                                            item.question ||
                                            '-';

                                        const category =
                                            question.category ||
                                            item.category ||
                                            '';

                                        const answer =
                                            item?.answer !== null &&
                                            item?.answer !== undefined &&
                                            item?.answer !== ''
                                                ? item.answer
                                                : 'Belum dijawab';

                                        return (
                                            <article
                                                key={
                                                    item.id ||
                                                    `${category}-${questionNumber}-${index}`
                                                }
                                                style={answerCardStyle}
                                            >
                                                <div style={questionHeaderStyle}>
                                                    <span style={numberBadgeStyle}>
                                                        {questionNumber}
                                                    </span>

                                                    <div style={{ flex: 1 }}>
                                                        <div style={categoryStyle}>
                                                            {category
                                                                ? `Kategori ${category}`
                                                                : 'Assessment Tambahan'}
                                                        </div>
                                                        <h3 style={questionStyle}>
                                                            {questionText}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div style={answerBoxStyle}>
                                                    <div style={answerLabelStyle}>
                                                        Jawaban
                                                    </div>
                                                    <div style={answerStyle}>
                                                        {answer}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <div style={bottomActionStyle}>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/assessments/${assessmentId}/result`
                                    )
                                }
                                style={secondaryButtonStyle}
                            >
                                Kembali ke Hasil Assessment
                            </button>
                        </div>
                    </>
                )}
            </main>
        </PageContainer>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <div style={infoLabelStyle}>{label}</div>
            <div style={infoValueStyle}>{value}</div>
        </div>
    );
}

function PageContainer({ children }) {
    return (
        <div className="kami-result-page"
            style={{
                minHeight: '100vh',
                background: '#f8fafc',
                fontFamily: 'Arial, sans-serif',
                color: '#1e293b',
            }}
        >
            {children}
        </div>
    );
}

const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 24px',
};

const headerStyle = {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
};

const titleStyle = {
    margin: '0 0 6px 0',
    fontSize: '26px',
    color: '#0f172a',
};

const subtitleStyle = {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
};

const sectionStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '20px',
};

const infoCardStyle = {
    ...sectionStyle,
    marginTop: '4px',
};

const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '20px',
};

const sectionTitleStyle = {
    margin: '0 0 6px 0',
    fontSize: '20px',
    color: '#0f172a',
};

const smallTextStyle = {
    margin: 0,
    color: '#64748b',
    lineHeight: '1.6',
    fontSize: '13px',
};

const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
};

const infoLabelStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '5px',
};

const infoValueStyle = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
};

const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
};

const answerCardStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '18px',
    background: '#ffffff',
};

const questionHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
};

const numberBadgeStyle = {
    minWidth: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#eff6ff',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
};

const categoryStyle = {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px',
};

const questionStyle = {
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#0f172a',
    fontWeight: '600',
};

const answerBoxStyle = {
    marginTop: '16px',
    padding: '14px 16px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
};

const answerLabelStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '6px',
    fontWeight: '600',
};

const answerStyle = {
    fontSize: '14px',
    color: '#1e293b',
    lineHeight: '1.6',
    fontWeight: '600',
};

const messageCardStyle = {
    ...sectionStyle,
    textAlign: 'center',
    color: '#64748b',
    marginTop: '4px',
};

const errorCardStyle = {
    ...sectionStyle,
    border: '1px solid #fecaca',
    marginTop: '4px',
};

const errorTitleStyle = {
    margin: '0 0 8px 0',
    color: '#991b1b',
    fontSize: '18px',
};

const paragraphStyle = {
    color: '#64748b',
    lineHeight: '1.6',
};

const emptyStyle = {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#64748b',
    border: '1px dashed #cbd5e1',
    borderRadius: '10px',
};

const bottomActionStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '20px',
    paddingBottom: '30px',
};

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
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
};

export default AdditionalResult;
