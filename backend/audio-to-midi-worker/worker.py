import asyncio
from worker_manager import WorkerManager
from processor import Processor
from utils import setup_gpu
import tensorflow as tf

tf.get_logger().setLevel("ERROR")
tf.autograph.set_verbosity(0)


async def main():
    setup_gpu()

    processor = Processor()

    worker_manager = WorkerManager(processor, queue_name="audio-to-midi")
    await worker_manager.start_worker()


if __name__ == "__main__":
    asyncio.run(main())
