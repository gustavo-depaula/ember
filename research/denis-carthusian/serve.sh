#!/usr/bin/env bash
# Serve one OCR model on :8000 for ocr_local.py. flashinfer's sampler compiles
# with nvcc, which this machine lacks, so vLLM's own sampler is used instead.
set -euo pipefail
cd "$(dirname "$0")"
export VLLM_USE_FLASHINFER_SAMPLER=0
common=(--limit-mm-per-prompt '{"image": 1, "video": 0}' --port 8000)
case "$1" in
  dots) exec .venv/bin/vllm serve rednote-hilab/dots.mocr --trust-remote-code --gpu-memory-utilization 0.92 \
    --chat-template-content-format string --max-model-len 16000 \
    --mm-processor-kwargs '{"max_pixels": 4000000}' --served-model-name dots "${common[@]}" ;;
  olmocr) exec .venv/bin/vllm serve allenai/olmOCR-2-7B-1025-FP8 --max-model-len 8000 --max-num-seqs 4 --enforce-eager --gpu-memory-utilization 0.97 \
    --mm-processor-kwargs '{"max_pixels": 1700000}' \
    --served-model-name olmocr "${common[@]}" ;;
  chandra) exec .venv/bin/vllm serve datalab-to/chandra-ocr-2 --quantization fp8 --max-model-len 20000 --gpu-memory-utilization 0.95 \
    --max-num-seqs 4 --enforce-eager --mm-processor-kwargs '{"max_pixels": 6291456}' \
    --served-model-name chandra "${common[@]}" ;;
  *) echo "usage: $0 dots|olmocr|chandra" >&2; exit 1 ;;
esac
