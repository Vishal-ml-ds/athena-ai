"""Real browser automation via Playwright (headless Chromium on Modal).

Replaces the earlier "AI Task Planner" simulation with an actual browser that:
- navigates to a URL
- captures a screenshot (PNG bytes, base64 for SSE)
- extracts visible text content

The browser agent LLM decides the target URL and any follow-up action.
Everything runs in a single async Playwright context per task — no daemons,
safe for Modal's stateless function model.
"""

from __future__ import annotations

import asyncio
import base64
import logging
from typing import AsyncGenerator

from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

BROWSER_TIMEOUT_MS = 20_000
MAX_TEXT_CHARS = 4_000


async def run_browser_task(
    url: str,
    task: str,
    wait_selector: str | None = None,
) -> AsyncGenerator[dict, None]:
    """Open a headless Chromium, navigate, screenshot, and extract visible text.

    Yields dicts that the router wraps as SSE events:
      - {"type": "status", "message": "..."}
      - {"type": "screenshot", "png_base64": "..."}
      - {"type": "extract", "content": "..."}
      - {"type": "error", "message": "..."}
    """
    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled",
                ],
            )
            try:
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                    ),
                    viewport={"width": 1280, "height": 720},
                )
                page = await context.new_page()

                yield {"type": "status", "message": f"navigating to {url}"}
                await page.goto(url, timeout=BROWSER_TIMEOUT_MS, wait_until="domcontentloaded")

                if wait_selector:
                    try:
                        await page.wait_for_selector(wait_selector, timeout=BROWSER_TIMEOUT_MS)
                    except Exception:
                        # Selector not found is a soft-fail — continue with what we have.
                        pass

                # Small settle delay for late-loading content.
                await asyncio.sleep(0.8)

                yield {"type": "status", "message": "capturing screenshot"}
                png = await page.screenshot(full_page=False)
                yield {
                    "type": "screenshot",
                    "png_base64": base64.b64encode(png).decode(),
                }

                yield {"type": "status", "message": "extracting page text"}
                text = await page.evaluate(
                    "() => (document.body ? document.body.innerText : '').trim()"
                )
                yield {
                    "type": "extract",
                    "content": text[:MAX_TEXT_CHARS],
                    "title": await page.title(),
                    "final_url": page.url,
                }
            finally:
                await browser.close()

    except Exception as exc:
        logger.warning("Browser task failed: %s", str(exc)[:300])
        yield {"type": "error", "message": str(exc)[:300]}
