from utils import check_device
import asyncio
from processor import Processor
from worker_manager import WorkerManager


async def main():
    check_device()

    processor = Processor(model="medium.en")

    worker_manager = WorkerManager(processor, queue_name="transcribe")
    await worker_manager.start_worker()


if __name__ == "__main__":
    asyncio.run(main())
