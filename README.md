# Taxi Trips Cancellation Rate – Solutions

##### The solution was implemented using Laravel 12 with React for the frontend.
##### I chose not to use the ORM in the reporting layer, as the task is aggregation-heavy and better suited for direct database queries for clarity and performance.
##### The Vite configuration was adjusted to support HMR in a Docker-based local environment, with the host set to assessment.local to match the domain used in the browser.
##### The application environment was also updated by setting APP_URL=http://assessment.local to ensure correct URL resolution in the local setup.

## Part A – SQL / Database

### Q1 – Cancellation Rate per Day (Core)

```sql
WITH cte AS (
    SELECT
    DATE(t.request_at) AS day,
    COUNT(*) AS total,
    SUM(
    CASE
    WHEN t.status IN ('cancelled_by_driver', 'cancelled_by_client')
    THEN 1 ELSE 0
    END
    ) AS canceled
FROM trips t
    JOIN users uc
ON uc.id = t.client_id
    AND uc.banned = 'no'
    AND uc.role = 'client'
    JOIN users ud
    ON ud.id = t.driver_id
    AND ud.banned = 'no'
    AND ud.role = 'driver'
WHERE t.request_at >= '2013-10-01'
  AND t.request_at <=  '2013-10-03'
GROUP BY DATE(t.request_at)
    )
SELECT
    day AS `Day`,
    ROUND(canceled / NULLIF(total, 0), 2) AS `Cancellation Rate`
FROM cte
ORDER BY day;


```

### Q2 – Data Modeling / Indexing

**Indexes to add**

* `Trips(request_at)` to speed up the date range filter.
* `Trips(client_id)` and `Trips(driver_id)` (or a composite like
  `Trips(request_at, client_id, driver_id)`) to speed up joins and filtering
  by date simultaneously.
* `Users(users_id, banned)` (or keep `users_id` as PK and add a separate
  `Users(banned)` if needed) to make the banned filter efficient when joined
  from trips.

**request_at type**

Use a `DATE` (or `DATETIME`/`TIMESTAMP` if time-of-day matters) column instead
of `VARCHAR`. Native date types are more compact, validate input, allow date
arithmetic, and index/range queries are more efficient and reliable.

## Part B – Algorithm / Coding

### Q3 – Function to Compute Daily Cancellation Rate

### javascript

```javascript
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
```
### python

```python
users = [
    {"id": 1, "banned": "No", "role": "client"},
    {"id": 2, "banned": "No", "role": "driver"},
    {"id": 3, "banned": "Yes", "role": "client"},
    {"id": 4, "banned": "No", "role": "driver"},
    {"id": 5, "banned": "No", "role": "client"},
    {"id": 6, "banned": "Yes", "role": "driver"},
]

trips = [
    {
        "id": 1,
        "client_id": 1,
        "driver_id": 2,
        "city_id": 1,
        "status": "completed",
        "request_at": "2023-10-01",
    },
    {
        "id": 2,
        "client_id": 1,
        "driver_id": 4,
        "city_id": 1,
        "status": "cancelled_by_client",
        "request_at": "2023-10-01",
    },
    {
        "id": 3,
        "client_id": 5,
        "driver_id": 2,
        "city_id": 2,
        "status": "cancelled_by_driver",
        "request_at": "2023-10-01",
    },
    {
        "id": 4,
        "client_id": 3,  # client banned
        "driver_id": 2,
        "city_id": 2,
        "status": "completed",
        "request_at": "2023-10-02",
    },
    {
        "id": 5,
        "client_id": 1,
        "driver_id": 6,  # driver banned
        "city_id": 1,
        "status": "cancelled_by_driver",
        "request_at": "2023-10-02",
    },
    {
        "id": 6,
        "client_id": 5,
        "driver_id": 4,
        "city_id": 3,
        "status": "completed",
        "request_at": "2023-10-02",
    },
    {
        "id": 7,
        "client_id": 5,
        "driver_id": 4,
        "city_id": 3,
        "status": "cancelled_by_client",
        "request_at": "2023-10-03",
    },
    {
        "id": 8,
        "client_id": 1,
        "driver_id": 2,
        "city_id": 1,
        "status": "completed",
        "request_at": "2023-10-03",
    },
]

start_date = "2023-10-01"
end_date = "2023-10-03"


def cancellation_rates(users, trips, start_date, end_date):
    user_status = {user["id"]: user["banned"] for user in users}

    totals_by_day = {}
    cancelled_by_day = {}

    for trip in trips:
        if trip["request_at"] < start_date or trip["request_at"] > end_date:
            continue

        client_banned = user_status.get(trip["client_id"])
        driver_banned = user_status.get(trip["driver_id"])

        if client_banned != "No" or driver_banned != "No":
            continue

        day = trip["request_at"]
        totals_by_day[day] = totals_by_day.get(day, 0) + 1

        if trip["status"] in ("cancelled_by_driver", "cancelled_by_client"):
            cancelled_by_day[day] = cancelled_by_day.get(day, 0) + 1

    results = []
    for day, total in totals_by_day.items():
        cancelled = cancelled_by_day.get(day, 0)
        rate = 0 if total == 0 else round(cancelled / total, 2)
        results.append({
            "day": day,
            "cancellation_rate": rate
        })

    return results

print(cancellation_rates(users, trips, start_date, end_date))
```

**Time complexity**: `O(U + T)` where `U` is the number of users and `T` is the
number of trips.

**Data structures used**: `Map` for user lookup (`userStatus`) and two `Map`s
for per-day totals and cancellations to keep constant-time updates.

### Q4 – Edge Cases

* **A day has no valid trips (all trips involve banned/missing users).**
  Expected: that day is omitted from the output entirely.
* **All valid trips are completed (no cancellations).**
  Expected: cancellation rate is `0.00` for that day.
