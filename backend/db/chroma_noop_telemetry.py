from chromadb.config import System
from chromadb.telemetry.product import ProductTelemetryClient, ProductTelemetryEvent
from overrides import override


class NoOpProductTelemetry(ProductTelemetryClient):
    """Disable Chroma product telemetry events in local/offline environments."""

    def __init__(self, system: System):
        super().__init__(system)

    @override
    def capture(self, event: ProductTelemetryEvent) -> None:
        # Intentionally no-op.
        return
