from ..celery import celery

@celery.task
def bulk_create_apartment(x, y):
    return x + y