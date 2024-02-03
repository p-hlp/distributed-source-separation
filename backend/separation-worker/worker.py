import asyncio
from worker_manager import WorkerManager
from separation_processor import SeparationProcessor
from utils import check_device


async def main():
    check_device()

    processor = SeparationProcessor(model="htdemucs")

    worker_manager = WorkerManager(processor, queue_name="separate")
    await worker_manager.start_worker()


if __name__ == "__main__":
    asyncio.run(main())
