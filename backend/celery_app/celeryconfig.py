task_serializer = 'json'
result_serializer = 'json'
accept_content = ['json']
timezone = 'Asia/Tashkent'
enable_utc = True

include = [
    'celery_app.tasks.bulk_create_apartments_task',
]

# task_routes = {
#     'tasks.add': 'low-priority',
# }
#
# task_annotations = {
#     'tasks.add': {'rate_limit': '10/m'}
# }
