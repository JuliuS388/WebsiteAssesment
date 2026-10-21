import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import api from '../services/api';

function History() {
    const navigate = useNavigate();

    const [assessments, setAssessments] = useState([]);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] =
        useState('all');

    const [deletingId, setDeletingId] =
        useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await api.get('/assessments');

            const assessmentData =
                response.data?.data || [];

            setAssessments(assessmentData);

            const resultEntries =
                await Promise.all(
                    assessmentData.map(
                        async (assessment) => {
                            try {
                                const resultResponse =
                                    await api.get(
                                        `/assessments/${assessment.id}/result`
                                    );

                                return [
                                    assessment.id,
                                    resultResponse
                                        .data
                                        ?.data || null,
                                ];
                            } catch (err) {
                                return [
                                    assessment.id,
                                    null,
                                ];
                            }
                        }
                    )
                );

            setResults(
                Object.fromEntries(
                    resultEntries
                )
            );
        } catch (err) {
            console.error(
                'Gagal memuat history:',
                err
            );

            setError(
                err.response?.data?.message ||
                    'Riwayat assessment gagal dimuat.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getResult = (assessmentId) => {
        return results[assessmentId] || null;
    };

    const getStatus = (assessment) => {
        const result =
            getResult(assessment.id);

        if (result) {
            return 'completed';
        }

        return assessment.status ===
            'completed'
            ? 'completed'
            : 'draft';
    };

    const filteredAssessments =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            return assessments.filter(
                (assessment) => {
                    const result =
                        getResult(
                            assessment.id
                        );

                    const status =
                        result
                            ? 'completed'
                            : assessment.status ===
                              'completed'
                            ? 'completed'
                            : 'draft';

                    const matchesSearch =
                        !keyword ||
                        String(
                            assessment.school_name ||
                                ''
                        )
                            .toLowerCase()
                            .includes(keyword) ||
                        String(
                            assessment.respondent_name ||
                                ''
                        )
                            .toLowerCase()
                            .includes(keyword) ||
                        String(
                            assessment.assessment_period ||
                                ''
                        )
                            .toLowerCase()
                            .includes(keyword);

                    const matchesStatus =
                        statusFilter ===
                            'all' ||
                        status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            assessments,
            results,
            search,
            statusFilter,
        ]);

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return '-';
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(
            date.getTime()
        )) {
            return '-';
        }

        return date.toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }
        );
    };

    const formatScore = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return '-';
        }

        return number.toFixed(2);
    };

    const handleOpen = (assessment) => {
        const result =
            getResult(assessment.id);

        if (result) {
            navigate(
                `/assessments/${assessment.id}/result`
            );
            return;
        }

        navigate(
            `/assessments/${assessment.id}/kami`
        );
    };

    const handleDelete = async (
        assessment
    ) => {
        const confirmed =
            window.confirm(
                `Apakah Anda yakin ingin menghapus assessment "${assessment.school_name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(
                assessment.id
            );
            setError('');

            await api.delete(
                `/assessments/${assessment.id}`
            );

            setAssessments(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            assessment.id
                    )
            );

            setResults(
                (previous) => {
                    const updated = {
                        ...previous,
                    };

                    delete updated[
                        assessment.id
                    ];

                    return updated;
                }
            );
        } catch (err) {
            console.error(
                'Gagal menghapus assessment:',
                err
            );

            setError(
                err.response?.data?.message ||
                    'Assessment gagal dihapus.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    const completedCount =
        assessments.filter(
            (assessment) =>
                getStatus(assessment) ===
                'completed'
        ).length;

    const draftCount =
        assessments.length -
        completedCount;

    if (loading) {
        return (
            <div className="kami-history-page"
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                        '#f8fafc',
                    fontFamily:
                        'Arial, sans-serif',
                    color: '#334155',
                }}
            >
                Memuat riwayat assessment...
            </div>
        );
    }

    return (
        <div className="kami-history-page"
            style={{
                minHeight: '100vh',
                background:
                    '#f8fafc',
                fontFamily:
                    'Arial, sans-serif',
                color: '#1e293b',
            }}
        >
            <header
                style={{
                    background:
                        '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    padding:
                        '16px 24px',
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
                        gap: '16px',
                        flexWrap:
                            'wrap',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize:
                                    '20px',
                                fontWeight:
                                    '700',
                            }}
                        >
                            Riwayat Assessment
                        </div>

                        <div
                            style={{
                                marginTop:
                                    '4px',
                                fontSize:
                                    '13px',
                                color:
                                    '#64748b',
                            }}
                        >
                            Riwayat penilaian
                            keamanan informasi
                            sekolah
                        </div>
                    </div>

                    <div
                        style={{
                            display:
                                'flex',
                            gap: '10px',
                            flexWrap:
                                'wrap',
                        }}
                    >
                        <button
                            onClick={() =>
                                navigate('/')
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
                            ← Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    '/assessments/new'
                                )
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
                            + Assessment Baru
                        </button>
                    </div>
                </div>
            </header>

            <main
                style={{
                    maxWidth:
                        '1400px',
                    margin:
                        '0 auto',
                    padding:
                        '28px 24px 40px',
                }}
            >
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
                                '10px',
                            padding:
                                '14px 16px',
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
                            'grid',
                        gridTemplateColumns:
                            'repeat(3, minmax(0, 1fr))',
                        gap: '16px',
                        marginBottom:
                            '24px',
                    }}
                >
                    <SummaryCard
                        title="Total Assessment"
                        value={
                            assessments.length
                        }
                        description="Seluruh assessment"
                    />

                    <SummaryCard
                        title="Selesai"
                        value={
                            completedCount
                        }
                        description="Assessment yang sudah dihitung"
                    />

                    <SummaryCard
                        title="Draft"
                        value={
                            draftCount
                        }
                        description="Assessment yang belum selesai"
                    />
                </div>

                <div
                    style={{
                        background:
                            '#ffffff',
                        border:
                            '1px solid #e2e8f0',
                        borderRadius:
                            '14px',
                        padding:
                            '20px',
                        marginBottom:
                            '20px',
                    }}
                >
                    <div
                        style={{
                            display:
                                'flex',
                            gap: '12px',
                            flexWrap:
                                'wrap',
                        }}
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Cari sekolah, responden, atau periode..."
                            style={{
                                flex: '1',
                                minWidth:
                                    '260px',
                                padding:
                                    '11px 14px',
                                border:
                                    '1px solid #cbd5e1',
                                borderRadius:
                                    '8px',
                                fontSize:
                                    '14px',
                                outline:
                                    'none',
                            }}
                        />

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target
                                        .value
                                )
                            }
                            style={{
                                padding:
                                    '11px 14px',
                                border:
                                    '1px solid #cbd5e1',
                                borderRadius:
                                    '8px',
                                background:
                                    '#ffffff',
                                fontSize:
                                    '14px',
                            }}
                        >
                            <option value="all">
                                Semua Status
                            </option>
                            <option value="completed">
                                Selesai
                            </option>
                            <option value="draft">
                                Draft
                            </option>
                        </select>

                        <button
                            onClick={
                                loadHistory
                            }
                            style={{
                                padding:
                                    '11px 16px',
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
                            ↻ Refresh
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        background:
                            '#ffffff',
                        border:
                            '1px solid #e2e8f0',
                        borderRadius:
                            '14px',
                        overflow:
                            'hidden',
                    }}
                >
                    <div
                        style={{
                            padding:
                                '20px 22px',
                            borderBottom:
                                '1px solid #e2e8f0',
                        }}
                    >
                        <h2
                            style={{
                                margin:
                                    '0 0 5px',
                                fontSize:
                                    '18px',
                            }}
                        >
                            Daftar Assessment
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color:
                                    '#64748b',
                                fontSize:
                                    '14px',
                            }}
                        >
                            Menampilkan{' '}
                            {
                                filteredAssessments.length
                            }{' '}
                            dari{' '}
                            {
                                assessments.length
                            }{' '}
                            assessment.
                        </p>
                    </div>

                    {filteredAssessments.length ===
                    0 ? (
                        <div
                            style={{
                                padding:
                                    '60px 20px',
                                textAlign:
                                    'center',
                                color:
                                    '#64748b',
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        '42px',
                                    marginBottom:
                                        '12px',
                                }}
                            >
                                📋
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        '17px',
                                    fontWeight:
                                        '600',
                                    color:
                                        '#334155',
                                    marginBottom:
                                        '6px',
                                }}
                            >
                                Belum ada assessment
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        '14px',
                                }}
                            >
                                Buat assessment baru
                                untuk memulai
                                penilaian.
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                overflowX:
                                    'auto',
                            }}
                        >
                            <table
                                style={{
                                    width:
                                        '100%',
                                    borderCollapse:
                                        'collapse',
                                    minWidth:
                                        '1050px',
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            background:
                                                '#f8fafc',
                                        }}
                                    >
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            No
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Sekolah
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Responden
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Periode
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Tanggal
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Status
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Skor KAMI
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Kematangan
                                        </th>
                                        <th
                                            style={tableHeaderStyle}
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAssessments.map(
                                        (
                                            assessment,
                                            index
                                        ) => {
                                            const result =
                                                getResult(
                                                    assessment.id
                                                );

                                            const status =
                                                getStatus(
                                                    assessment
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        assessment.id
                                                    }
                                                >
                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        {index +
                                                            1}
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    '600',
                                                                color:
                                                                    '#1e293b',
                                                            }}
                                                        >
                                                            {
                                                                assessment.school_name
                                                            }
                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '4px',
                                                                fontSize:
                                                                    '12px',
                                                                color:
                                                                    '#64748b',
                                                            }}
                                                        >
                                                            ID #
                                                            {
                                                                assessment.id
                                                            }
                                                        </div>
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        <div>
                                                            {
                                                                assessment.respondent_name ||
                                                                    '-'
                                                            }
                                                        </div>

                                                        {assessment.respondent_role && (
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        '4px',
                                                                    fontSize:
                                                                        '12px',
                                                                    color:
                                                                        '#64748b',
                                                                }}
                                                            >
                                                                {
                                                                    assessment.respondent_role
                                                                }
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        {
                                                            assessment.assessment_period ||
                                                                '-'
                                                        }
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        {formatDate(
                                                            assessment.assessment_date ||
                                                                assessment.created_at
                                                        )}
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        <StatusBadge
                                                            status={
                                                                status
                                                            }
                                                        />
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        {result
                                                            ? formatScore(
                                                                  result.total_score
                                                              )
                                                            : '-'}
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        {result
                                                            ? result
                                                                  .maturity_level ||
                                                              '-'
                                                            : '-'}
                                                    </td>

                                                    <td
                                                        style={
                                                            tableCellStyle
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    'flex',
                                                                gap:
                                                                    '8px',
                                                                flexWrap:
                                                                    'wrap',
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    handleOpen(
                                                                        assessment
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        '8px 12px',
                                                                    border:
                                                                        'none',
                                                                    background:
                                                                        '#2563eb',
                                                                    color:
                                                                        '#ffffff',
                                                                    borderRadius:
                                                                        '7px',
                                                                    cursor:
                                                                        'pointer',
                                                                    fontWeight:
                                                                        '600',
                                                                    fontSize:
                                                                        '13px',
                                                                }}
                                                            >
                                                                {result
                                                                    ? 'Lihat Hasil'
                                                                    : 'Lanjutkan'}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        assessment
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    assessment.id
                                                                }
                                                                style={{
                                                                    padding:
                                                                        '8px 12px',
                                                                    border:
                                                                        '1px solid #fecaca',
                                                                    background:
                                                                        '#ffffff',
                                                                    color:
                                                                        '#dc2626',
                                                                    borderRadius:
                                                                        '7px',
                                                                    cursor:
                                                                        deletingId ===
                                                                        assessment.id
                                                                            ? 'not-allowed'
                                                                            : 'pointer',
                                                                    fontWeight:
                                                                        '600',
                                                                    fontSize:
                                                                        '13px',
                                                                }}
                                                            >
                                                                {deletingId ===
                                                                assessment.id
                                                                    ? 'Menghapus...'
                                                                    : 'Hapus'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    description,
}) {
    return (
        <div
            style={{
                background:
                    '#ffffff',
                border:
                    '1px solid #e2e8f0',
                borderRadius:
                    '12px',
                padding:
                    '20px',
            }}
        >
            <div
                style={{
                    fontSize:
                        '13px',
                    color:
                        '#64748b',
                    marginBottom:
                        '8px',
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize:
                        '30px',
                    fontWeight:
                        '700',
                    color:
                        '#1e293b',
                }}
            >
                {value}
            </div>

            <div
                style={{
                    marginTop:
                        '6px',
                    fontSize:
                        '12px',
                    color:
                        '#94a3b8',
                }}
            >
                {description}
            </div>
        </div>
    );
}

function StatusBadge({
    status,
}) {
    const completed =
        status ===
        'completed';

    return (
        <span
            style={{
                display:
                    'inline-flex',
                alignItems:
                    'center',
                padding:
                    '5px 10px',
                borderRadius:
                    '999px',
                fontSize:
                    '12px',
                fontWeight:
                    '600',
                background:
                    completed
                        ? '#dcfce7'
                        : '#fef3c7',
                color:
                    completed
                        ? '#166534'
                        : '#92400e',
            }}
        >
            {completed
                ? 'Selesai'
                : 'Draft'}
        </span>
    );
}

const tableHeaderStyle = {
    padding:
        '13px 14px',
    textAlign:
        'left',
    fontSize:
        '12px',
    fontWeight:
        '700',
    color:
        '#475569',
    borderBottom:
        '1px solid #e2e8f0',
    whiteSpace:
        'nowrap',
};

const tableCellStyle = {
    padding:
        '14px',
    borderBottom:
        '1px solid #f1f5f9',
    fontSize:
        '13px',
    verticalAlign:
        'top',
};

export default History;