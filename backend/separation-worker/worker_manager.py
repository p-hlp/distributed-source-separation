import os
import asyncio
from bullmq import Worker
from dotenv import load_dotenv
from separation_processor import SeparationProcessor

load_dotenv()


class WorkerManager:
    def __init__(self, processor: SeparationProcessor, queue_name="process"):
        self.processor = processor
        self.queue_name = queue_name
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = os.getenv("REDIS_PORT", "6379")
        # https://docs.bullmq.io/bull/important-notes
        self.opts = {
            "connection": f"redis://{redis_host}:{redis_port}",
            "stalledInterval": 60000,  # 60 seconds
            "lockDuration": 60000,  # 60 seconds
        }
        self.worker = None

    async def start_worker(self):
        print("Starting worker...")
        self.worker = Worker(self.queue_name, self.processor.process, self.opts)
        while True:
            await asyncio.sleep(1)

    async def stop_worker(self):
        if self.worker:
            await self.worker.close()
