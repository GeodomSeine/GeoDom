from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
import time
from resources.parser import main as parser_main
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('watcher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('watcher')

class DatavizFolderHandler(FileSystemEventHandler):
    def __init__(self, scheduler):
        self.scheduler = scheduler
        self.last_triggered = 0
        self.cooldown = 5  # Cooldown de 5 secondes pour éviter les déclenchements multiples

    def on_modified(self, event):
        if not event.is_directory and time.time() - self.last_triggered > self.cooldown:
            # Vérifier si le fichier modifié est dans un dossier dataviz
            if "dataviz" in event.src_path:
                logger.info(f"Modification détectée dans: {event.src_path}")
                self.schedule_immediate_parse()
                self.last_triggered = time.time()

    def on_created(self, event):
        if "dataviz" in event.src_path:
            logger.info(f"Nouveau fichier/dossier créé: {event.src_path}")
            self.schedule_immediate_parse()
            self.last_triggered = time.time()

    def schedule_immediate_parse(self):
        """Planifie une exécution immédiate du parser"""
        try:
            # Supprimer la tâche existante si elle existe
            try:
                self.scheduler.remove_job('immediate_parse')
            except:
                pass
            
            # Ajout d'une nouvelle tâche immédiate
            self.scheduler.add_job(
                parser_main,
                'date',  # Exécution unique immédiate
                id='immediate_parse',
                name='Vérification immédiate des dossiers',
                misfire_grace_time=None
            )
            logger.info("Analyse immédiate planifiée")
        except Exception as e:
            logger.error(f"Erreur lors de la planification de l'analyse immédiate: {e}")

def setup_watcher(scheduler: AsyncIOScheduler, watch_path: str = "resources/dataviz"):
    """Configure le watcher et le scheduler"""

    """Le watcher pour surveiller les modifications dans le dossier dataviz."""
    path_to_watch = os.path.join(os.path.dirname(os.path.abspath(__file__)), watch_path)
    
    #if not os.path.exists(path_to_watch):
    #    os.makedirs(path_to_watch)
    try:
        # Configuration du watcher
        event_handler = DatavizFolderHandler(scheduler)
        observer = Observer()
        observer.schedule(event_handler, path=path_to_watch, recursive=True)
        observer.start()
        logger.info(f"Surveillance démarrée sur le répertoire: {path_to_watch}")

        # Garder la vérification quotidienne
        scheduler.add_job(
            parser_main,
            CronTrigger(hour=0, minute=0),  # À minuit
            id='daily_full_check',
            name='Vérification quotidienne complète',
            misfire_grace_time=None
        )

        return observer

    except Exception as e:
        logger.error(f"Erreur lors de la configuration du watcher: {e}")
        raise