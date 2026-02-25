# FinTrack CDN Migration Guide
#
# The Contents/ directory contains ~294MB of raw media assets.
# These are committed to Git for reference but should be served via CDN in production.
#
# Recommended CDN options:
#   1. Cloudflare R2  — Free egress, S3-compatible, cheapest option
#   2. Vercel Blob    — Native integration if already on Vercel
#   3. Supabase Storage — Already have an account, simple integration
#   4. Cloudinary     — Free tier with auto-optimization
#
# Migration steps:
#   1. Upload Contents/*.mp4 and Contents/*.png to your chosen CDN
#   2. Update src/config/videos.js to use CDN URLs instead of /videos/ paths
#   3. Remove Contents/ from .gitignore exception or delete from repo
#   4. Run: git filter-branch --force --tree-filter 'rm -rf Contents' HEAD
#      (or use BFG Repo Cleaner for faster results)
#
# After migration, the repo size will drop from ~300MB to ~10MB.
