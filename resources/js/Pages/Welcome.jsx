import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const buildDefaultRange = () => ({
    startDate: new Date(2013, 9, 1),
    endDate: new Date(2013, 9, 3),
});

const formatDate = (date) => {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const validateRange = ({ startDate, endDate }) => {
    const errors = {};

    if (!startDate) {
        errors.startDate = 'Please select a start date.';
    }

    if (!endDate) {
        errors.endDate = 'Please select an end date.';
    }

    if (startDate && endDate && startDate > endDate) {
        errors.endDate = 'End date must be on or after the start date.';
    }

    return errors;
};

export default function Welcome() {
    const defaults = useMemo(() => buildDefaultRange(), []);
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState([]);
    const [apiError, setApiError] = useState('');

    const fetchRates = async ({ startDate: fromDate, endDate: toDate }) => {
        const formattedStart = formatDate(fromDate);
        const formattedEnd = formatDate(toDate);
        const nextErrors = validateRange({ startDate: fromDate, endDate: toDate });

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setLoading(true);
        setApiError('');

        const params = new URLSearchParams({
            start_date: formattedStart,
            end_date: formattedEnd,
        });

        try {
            const response = await fetch(
                `/reports/cancellation-rate?${params.toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Unable to load data.');
            }

            const payload = await response.json();
            setRates(payload.data ?? []);
        } catch (error) {
            setApiError('Unable to load the report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates({ startDate, endDate });
        console.log(
            cancellationRates(users, trips, startDateConsole, endDateConsole)
        );
    }, []);

    const totalDays = useMemo(() => {
        if (!rates.length) {
            return 0;
        }
        const values = rates.map((rate) => rate.cancellation_rate);
        return values.length;
    }, [rates]);




    const handleSubmit = (event) => {
        event.preventDefault();
        fetchRates({ startDate, endDate });
    };







    let users = [
        { id: 1, banned: "No", role: "client" },
        { id: 2, banned: "No", role: "driver" },
        { id: 3, banned: "Yes", role: "client" },
        { id: 4, banned: "No", role: "driver" },
        { id: 5, banned: "No", role: "client" },
        { id: 6, banned: "Yes", role: "driver" },
    ];

    let trips = [
        {
            id: 1,
            client_id: 1,
            driver_id: 2,
            city_id: 1,
            status: "completed",
            request_at: "2023-10-01",
        },
        {
            id: 2,
            client_id: 1,
            driver_id: 4,
            city_id: 1,
            status: "cancelled_by_client",
            request_at: "2023-10-01",
        },
        {
            id: 3,
            client_id: 5,
            driver_id: 2,
            city_id: 2,
            status: "cancelled_by_driver",
            request_at: "2023-10-01",
        },
        {
            id: 4,
            client_id: 3, // client banned
            driver_id: 2,
            city_id: 2,
            status: "completed",
            request_at: "2023-10-02",
        },
        {
            id: 5,
            client_id: 1,
            driver_id: 6, // driver banned
            city_id: 1,
            status: "cancelled_by_driver",
            request_at: "2023-10-02",
        },
        {
            id: 6,
            client_id: 5,
            driver_id: 4,
            city_id: 3,
            status: "completed",
            request_at: "2023-10-02",
        },
        {
            id: 7,
            client_id: 5,
            driver_id: 4,
            city_id: 3,
            status: "cancelled_by_client",
            request_at: "2023-10-03",
        },
        {
            id: 8,
            client_id: 1,
            driver_id: 2,
            city_id: 1,
            status: "completed",
            request_at: "2023-10-03",
        },
    ];
    let startDateConsole = "2023-10-01";
    let endDateConsole   = "2023-10-03";

    function cancellationRates(users, trips, startDate, endDate) {
        const userStatus = new Map();
        for (const user of users) {
            userStatus.set(user.id, user.banned);
        }

        const totalsByDay = new Map();
        const cancelledByDay = new Map();

        for (const trip of trips) {
            if (trip.request_at < startDate || trip.request_at > endDate) {
                continue;
            }

            const clientBanned = userStatus.get(trip.client_id);
            const driverBanned = userStatus.get(trip.driver_id);

            if (clientBanned !== 'No' || driverBanned !== 'No') {
                continue;
            }

            const day = trip.request_at;
            totalsByDay.set(day, (totalsByDay.get(day) || 0) + 1);

            if (
                trip.status === 'cancelled_by_driver' ||
                trip.status === 'cancelled_by_client'
            ) {
                cancelledByDay.set(day, (cancelledByDay.get(day) || 0) + 1);
            }
        }

        const results = [];
        for (const [day, total] of totalsByDay.entries()) {
            const cancelled = cancelledByDay.get(day) || 0;
            const rate = total === 0 ? 0 : cancelled / total;
            results.push({
                day,
                cancellation_rate: Number(rate.toFixed(2)),
            });
        }

        return results;
    }


    const maxRate = useMemo(() => {
        if (!rates.length) {
            return 0;
        }
        return Math.max(...rates.map((rate) => rate.cancellation_rate));
    }, [rates]);

    const chartData = useMemo(() => {
        if (!rates.length || maxRate === 0) {
            return [];
        }

        return rates.map((rate) => ({
            ...rate,
            height: Math.round((rate.cancellation_rate / maxRate) * 100),
        }));
    }, [maxRate, rates]);

    const chartPoints = useMemo(() => {
        if (!chartData.length) {
            return '';
        }

        if (chartData.length === 1) {
            return '50,10';
        }

        return chartData
            .map((rate, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = 100 - rate.height;
                return `${x},${y}`;
            })
            .join(' ');
    }, [chartData]);

    const chartStops = useMemo(() => {
        return chartData.map((rate, index) => {
            const offset = chartData.length === 1 ? 50 : (index / (chartData.length - 1)) * 100;
            const y = 100 - rate.height;
            return { ...rate, offset, y };
        });
    }, [chartData]);

    return (
        <>
            <Head title="Cancellation Rate" />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.35),_transparent_60%)]" />
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
                        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                                    Operations Reports
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                                    Cancellation Rate Dashboard
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm text-slate-600">
                                    Track daily trip performance, responsive experience powered by the /reports/cancellation-rate API.
                                </p>
                            </div>
                        </header>

                        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Daily cancellation table
                                        </h2>
                                        <p className="text-sm text-slate-600">
                                            Detailed breakdown for each day in the selected range.
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                                        {totalDays} days
                                    </span>
                                </div>
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                    <table className="w-full border-collapse text-left text-sm text-slate-700">
                                        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Day</th>
                                            <th className="px-4 py-3">Cancellation Rate</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                        {rates.length ? (
                                            rates.map((rate) => (
                                                <tr key={rate.day} className="bg-white">
                                                    <td className="px-4 py-3">{rate.day}</td>
                                                    <td className="px-4 py-3 font-semibold text-cyan-700">
                                                        {rate.cancellation_rate.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="px-4 py-6 text-center text-sm text-slate-500"
                                                >
                                                    No rows to display yet.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>


                            </div>

                            <div className="flex flex-col gap-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Report configuration
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Choose a start and end date to generate accurate
                                            insights with inline validation.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <label className="text-sm font-medium text-slate-700">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                                <span className="pt-2 text-sm font-medium text-slate-700 sm:w-24">
                                                    Start date
                                                </span>
                                                <div className="flex-1">
                                                    <DatePicker
                                                        selected={startDate}
                                                        onChange={(date) => setStartDate(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="date-picker-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                                                        calendarClassName="date-picker-calendar"
                                                        popperClassName="date-picker-popper"
                                                        showPopperArrow={false}
                                                    />
                                                </div>
                                            </div>

                                            {errors.startDate ? (
                                                <span className="text-xs text-rose-600">
                                                {errors.startDate}
                                            </span>
                                            ) : null}
                                        </label>

                                        <label className="text-sm font-medium text-slate-700">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                                <span className="pt-2 text-sm font-medium text-slate-700 sm:w-24">
                                                    End date
                                                </span>
                                                <div className="flex-1">
                                                    <DatePicker
                                                        selected={endDate}
                                                        onChange={(date) => setEndDate(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="date-picker-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                                                        calendarClassName="date-picker-calendar"
                                                        popperClassName="date-picker-popper"
                                                        minDate={startDate}
                                                        showPopperArrow={false}
                                                    />
                                                </div>
                                            </div>
                                            {errors.endDate ? (
                                                <span className="text-xs text-rose-600">
                                                    {errors.endDate}
                                                </span>
                                            ) : null}
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/60"
                                    >
                                        {loading ? 'Updating...' : 'Refresh report'}
                                    </button>

                                    {apiError ? (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                            {apiError}
                                        </div>
                                    ) : null}
                                </form>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Cancellation rate chart
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Visual trend of daily cancellations for the selected range.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Max
                                        </p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {maxRate.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {chartData.length ? (
                                <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
                                    <div className="flex flex-col justify-between text-xs font-medium text-slate-500">
                                        <span>{maxRate.toFixed(2)}</span>
                                        <span>0.00</span>
                                    </div>
                                    <div className="flex flex-col gap-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 px-6 py-8 shadow-inner">
                                        <div className="relative h-64 w-full">
                                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(transparent_75%,rgba(148,163,184,0.2)_75%),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[length:100%_25%,20%_100%]" />
                                            <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible">
                                                <defs>
                                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                                                        <stop offset="100%" stopColor="#0e7490" stopOpacity="0.45" />
                                                    </linearGradient>
                                                </defs>
                                                <polyline
                                                    fill="none"
                                                    stroke="#0891b2"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    points={chartPoints}
                                                />
                                                <polygon
                                                    points={`${chartPoints} 100,100 0,100`}
                                                    fill="url(#lineGradient)"
                                                />
                                                {chartStops.map((rate) => (
                                                    <circle
                                                        key={rate.day}
                                                        cx={rate.offset}
                                                        cy={rate.y}
                                                        r="3"
                                                        fill="#0e7490"
                                                        stroke="#e0f2fe"
                                                        strokeWidth="1.5"
                                                    />
                                                ))}
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                                    Run the report to display the cancellation rate chart.
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
