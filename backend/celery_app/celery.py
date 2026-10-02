from celery import Celery

celery = Celery('worker', backend="redis://redis:6379/1", broker="redis://redis:6379/0")
celery.config_from_object("celery_app.celeryconfig")
celery.autodiscover_tasks(["celery_app.tasks"])






