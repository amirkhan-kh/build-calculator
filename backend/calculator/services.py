from datetime import date
import calendar


def add_months_safe(start_date: date, months: int, target_day: int) -> date:
    year = start_date.year + (start_date.month - 1 + months) // 12
    month = (start_date.month - 1 + months) % 12 + 1

    last_day_of_month = calendar.monthrange(year, month)[1]
    day = min(target_day, last_day_of_month)

    return date(year, month, day)

def get_payment_dates(period_count: int, first_payment_date: date) -> list[date]:
    payment_dates = []
    payment_day = first_payment_date.day

    for i in range(period_count):
        payment_date = add_months_safe(first_payment_date, i, payment_day)
        payment_dates.append(payment_date)

    return payment_dates









