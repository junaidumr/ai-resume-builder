# Run from workspace root — delegates to the nested app folder
.PHONY: help all makeall dev setup

APP_DIR := ai-resume-builder

help:
	@$(MAKE) -C $(APP_DIR) help

all makeall setup install env docker-up db-push dev build check:
	@$(MAKE) -C $(APP_DIR) $@
