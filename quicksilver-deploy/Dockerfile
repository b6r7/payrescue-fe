ARG BASE_IMAGE=affirm-affirmlive.registry.snowflakecomputing.com/prod__quicksilver__us/infra/images/base-fastapi:latest
FROM ${BASE_IMAGE}

USER root

# Install Quicksilver auth library (injected by the CI pipeline)
COPY _libs_auth/ /tmp/quicksilver-auth/
RUN pip install --no-cache-dir /tmp/quicksilver-auth/ && rm -rf /tmp/quicksilver-auth/

# Install Python dependencies
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

USER appuser

# App manifest
COPY --chown=appuser:appuser app.yaml ./app.yaml

# Python backend
COPY --chown=appuser:appuser backend/ ./

# Built React SPA — run `npm run build` first, then copy dist/ here:
#   cp -r /path/to/afrm-payrescue/dist quicksilver-deploy/backend/dist
COPY --chown=appuser:appuser backend/dist/ ./dist/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
