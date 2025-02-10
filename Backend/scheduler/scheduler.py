# scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from watcher import setup_watcher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('scheduler')

# Creation du scheduler
scheduler = AsyncIOScheduler()
observer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère le cycle de vie du scheduler et du watcher"""
    global observer
    try:
        # Démarrer le watcher et le scheduler
        observer = setup_watcher(scheduler)
        scheduler.start()
        logger.info("Scheduler et watcher démarrés")
        yield
    finally:
        # Arrêter le scheduler et le watcher
        if observer:
            observer.stop()
            observer.join()
        scheduler.shutdown()
        logger.info("Scheduler et watcher arrêtés")

# Endpoint pour vérifier le statut des tâches planifiées
async def get_scheduler_status():
    """Retourne le statut des tâches planifiées"""
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            'id': job.id,
            'name': job.name,
            'next_run': str(job.next_run_time),
            'trigger': str(job.trigger)
        })
    return {
        'status': 'running' if scheduler.running else 'stopped',
        'watcher_status': 'running' if observer and observer.is_alive() else 'stopped',
        'jobs': jobs
    }