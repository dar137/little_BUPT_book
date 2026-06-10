-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: little_bupt_book
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '审计日志ID',
  `operator_id` bigint unsigned DEFAULT NULL COMMENT '操作人ID',
  `operator_role` enum('USER','ADMIN','SYSTEM') NOT NULL COMMENT '操作人角色',
  `action` varchar(128) NOT NULL COMMENT '操作类型',
  `target_type` varchar(64) DEFAULT NULL COMMENT '操作对象类型',
  `target_id` bigint unsigned DEFAULT NULL COMMENT '操作对象ID',
  `ip_address` varchar(64) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(512) DEFAULT NULL COMMENT '客户端信息',
  `detail` json DEFAULT NULL COMMENT '操作详情',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_audit_operator_time` (`operator_id`,`created_at`),
  KEY `idx_audit_action_time` (`action`,`created_at`),
  KEY `idx_audit_target` (`target_type`,`target_id`),
  CONSTRAINT `fk_audit_logs_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='审计日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `behavior_events`
--

DROP TABLE IF EXISTS `behavior_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `behavior_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '行为事件ID',
  `user_id` bigint unsigned DEFAULT NULL COMMENT '用户ID，未登录用户可为空',
  `event_type` enum('LOGIN','LOGOUT','VIEW_POST','CREATE_POST','LIKE_POST','COMMENT_POST','FAVORITE_POST','SEARCH','REPORT','FOLLOW') NOT NULL COMMENT '行为类型',
  `target_type` enum('POST','COMMENT','USER','SEARCH','SYSTEM') DEFAULT NULL COMMENT '行为对象类型',
  `target_id` bigint unsigned DEFAULT NULL COMMENT '行为对象ID',
  `search_keyword` varchar(255) DEFAULT NULL COMMENT '搜索关键词',
  `session_id` varchar(128) DEFAULT NULL COMMENT '会话ID',
  `ip_address` varchar(64) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(512) DEFAULT NULL COMMENT '客户端信息',
  `extra` json DEFAULT NULL COMMENT '扩展数据',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '行为发生时间',
  PRIMARY KEY (`id`),
  KEY `idx_behavior_user_time` (`user_id`,`created_at`),
  KEY `idx_behavior_event_type_time` (`event_type`,`created_at`),
  KEY `idx_behavior_target` (`target_type`,`target_id`),
  CONSTRAINT `fk_behavior_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户行为事件表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(64) NOT NULL COMMENT '分类名称',
  `description` varchar(255) DEFAULT NULL COMMENT '分类说明',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='内容分类表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_likes` (
  `comment_id` bigint unsigned NOT NULL COMMENT '评论ID',
  `user_id` bigint unsigned NOT NULL COMMENT '点赞用户ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`comment_id`,`user_id`),
  KEY `idx_comment_likes_user_id` (`user_id`),
  CONSTRAINT `fk_comment_likes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='评论点赞表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` bigint unsigned NOT NULL COMMENT '帖子ID',
  `user_id` bigint unsigned NOT NULL COMMENT '评论用户ID',
  `parent_id` bigint unsigned DEFAULT NULL COMMENT '父评论ID，用于回复评论',
  `content` text NOT NULL COMMENT '评论内容',
  `status` enum('PENDING_REVIEW','PUBLISHED','REJECTED','TAKEN_DOWN','DELETED') NOT NULL DEFAULT 'PENDING_REVIEW' COMMENT '评论状态',
  `like_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT '评论点赞数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `fk_comments_parent` (`parent_id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comments_status_created_at` (`status`,`created_at`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='评论表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `follower_id` bigint unsigned NOT NULL COMMENT '关注者ID',
  `followed_id` bigint unsigned NOT NULL COMMENT '被关注者ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
  PRIMARY KEY (`follower_id`,`followed_id`),
  KEY `fk_follows_followed` (`followed_id`),
  CONSTRAINT `fk_follows_followed` FOREIGN KEY (`followed_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follows_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_chk_1` CHECK ((`follower_id` <> `followed_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户关注表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `moderation_records`
--

DROP TABLE IF EXISTS `moderation_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderation_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '审核记录ID',
  `target_type` enum('POST','COMMENT') NOT NULL COMMENT '审核对象类型',
  `target_id` bigint unsigned NOT NULL COMMENT '审核对象ID',
  `submitter_id` bigint unsigned NOT NULL COMMENT '内容提交用户ID',
  `reviewer_id` bigint unsigned DEFAULT NULL COMMENT '人工审核管理员ID',
  `review_stage` enum('AI','HUMAN') NOT NULL COMMENT '审核阶段',
  `ai_model` varchar(128) DEFAULT NULL COMMENT 'AI审核模型名称',
  `ai_result` enum('PASS','REJECT','NEED_HUMAN') DEFAULT NULL COMMENT 'AI审核结果',
  `risk_level` enum('NONE','LOW','MEDIUM','HIGH') DEFAULT NULL COMMENT '风险等级',
  `confidence` decimal(5,4) DEFAULT NULL COMMENT 'AI审核置信度',
  `human_result` enum('PASS','REJECT','TAKE_DOWN','RESTORE') DEFAULT NULL COMMENT '人工审核结果',
  `final_result` enum('PASS','REJECT','TAKE_DOWN','RESTORE','NEED_HUMAN') DEFAULT NULL COMMENT '最终处理结果',
  `reason` varchar(512) DEFAULT NULL COMMENT '审核原因或说明',
  `raw_response` json DEFAULT NULL COMMENT 'AI原始返回结果',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `reviewed_at` datetime DEFAULT NULL COMMENT '人工审核时间',
  PRIMARY KEY (`id`),
  KEY `fk_moderation_submitter` (`submitter_id`),
  KEY `fk_moderation_reviewer` (`reviewer_id`),
  KEY `idx_moderation_target` (`target_type`,`target_id`),
  KEY `idx_moderation_stage_result` (`review_stage`,`final_result`),
  KEY `idx_moderation_created_at` (`created_at`),
  CONSTRAINT `fk_moderation_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_moderation_submitter` FOREIGN KEY (`submitter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='内容审核记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` bigint unsigned NOT NULL COMMENT '接收用户ID',
  `title` varchar(128) NOT NULL COMMENT '通知标题',
  `content` varchar(512) NOT NULL COMMENT '通知内容',
  `notice_type` enum('SYSTEM','REVIEW','REPORT','SANCTION','INTERACTION') NOT NULL DEFAULT 'SYSTEM' COMMENT '通知类型',
  `is_read` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已读',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `read_at` datetime DEFAULT NULL COMMENT '阅读时间',
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read_time` (`user_id`,`is_read`,`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统通知表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_favorites`
--

DROP TABLE IF EXISTS `post_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_favorites` (
  `post_id` bigint unsigned NOT NULL COMMENT '帖子ID',
  `user_id` bigint unsigned NOT NULL COMMENT '收藏用户ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `idx_post_favorites_user_id` (`user_id`),
  CONSTRAINT `fk_post_favorites_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_images`
--

DROP TABLE IF EXISTS `post_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `post_id` bigint unsigned NOT NULL COMMENT '帖子ID',
  `image_url` varchar(512) NOT NULL COMMENT '图片访问URL',
  `storage_key` varchar(255) DEFAULT NULL COMMENT '对象存储Key',
  `mime_type` varchar(64) DEFAULT NULL COMMENT '图片类型',
  `file_size` bigint unsigned DEFAULT NULL COMMENT '文件大小',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '图片排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_post_images_post_id` (`post_id`),
  CONSTRAINT `fk_post_images_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子图片表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `post_id` bigint unsigned NOT NULL COMMENT '帖子ID',
  `user_id` bigint unsigned NOT NULL COMMENT '点赞用户ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `idx_post_likes_user_id` (`user_id`),
  CONSTRAINT `fk_post_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子点赞表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` bigint unsigned NOT NULL COMMENT '帖子ID',
  `tag_id` bigint unsigned NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `idx_post_tags_tag_id` (`tag_id`),
  CONSTRAINT `fk_post_tags_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子标签关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` bigint unsigned NOT NULL COMMENT '发布用户ID',
  `category_id` bigint unsigned DEFAULT NULL COMMENT '分类ID',
  `title` varchar(128) DEFAULT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '正文内容',
  `content_type` enum('TEXT','IMAGE_TEXT','QUESTION','LOST_FOUND','PARTNER','SHARE') NOT NULL DEFAULT 'TEXT' COMMENT '内容类型',
  `status` enum('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED','TAKEN_DOWN','DELETED') NOT NULL DEFAULT 'PENDING_REVIEW' COMMENT '帖子状态',
  `view_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT '浏览数',
  `like_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT '点赞数',
  `comment_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT '评论数',
  `favorite_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT '收藏数',
  `published_at` datetime DEFAULT NULL COMMENT '发布时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_posts_user_id` (`user_id`),
  KEY `idx_posts_category_id` (`category_id`),
  KEY `idx_posts_status_created_at` (`status`,`created_at`),
  FULLTEXT KEY `ft_posts_title_content` (`title`,`content`),
  CONSTRAINT `fk_posts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '举报ID',
  `reporter_id` bigint unsigned NOT NULL COMMENT '举报人ID',
  `target_type` enum('POST','COMMENT','USER') NOT NULL COMMENT '举报对象类型',
  `target_id` bigint unsigned NOT NULL COMMENT '举报对象ID',
  `reason_type` varchar(64) NOT NULL COMMENT '举报原因类型',
  `reason_detail` varchar(512) DEFAULT NULL COMMENT '举报补充说明',
  `status` enum('PENDING','PROCESSING','ACCEPTED','REJECTED','CLOSED') NOT NULL DEFAULT 'PENDING' COMMENT '举报处理状态',
  `handler_id` bigint unsigned DEFAULT NULL COMMENT '处理管理员ID',
  `handle_result` varchar(512) DEFAULT NULL COMMENT '处理结果说明',
  `handled_at` datetime DEFAULT NULL COMMENT '处理时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_reports_reporter` (`reporter_id`),
  KEY `fk_reports_handler` (`handler_id`),
  KEY `idx_reports_target` (`target_type`,`target_id`),
  KEY `idx_reports_status_created_at` (`status`,`created_at`),
  CONSTRAINT `fk_reports_handler` FOREIGN KEY (`handler_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='举报记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `semantic_search_index`
--

DROP TABLE IF EXISTS `semantic_search_index`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semantic_search_index` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '索引ID',
  `target_type` enum('POST','COMMENT','TAG') NOT NULL COMMENT '索引对象类型',
  `target_id` bigint unsigned NOT NULL COMMENT '索引对象ID',
  `title_text` varchar(255) DEFAULT NULL COMMENT '标题文本',
  `content_text` text COMMENT '正文文本',
  `keyword_text` text COMMENT '关键词或分词结果',
  `embedding` json DEFAULT NULL COMMENT '语义向量，若使用外部向量库可为空',
  `model_name` varchar(128) DEFAULT NULL COMMENT '生成向量的大模型名称',
  `status` enum('VALID','INVALID') NOT NULL DEFAULT 'VALID' COMMENT '索引状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_search_target` (`target_type`,`target_id`),
  FULLTEXT KEY `ft_search_text` (`title_text`,`content_text`,`keyword_text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='语义检索索引表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` varchar(64) NOT NULL COMMENT '标签名称',
  `use_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT '使用次数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='标签表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sanctions`
--

DROP TABLE IF EXISTS `user_sanctions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sanctions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '治理记录ID',
  `user_id` bigint unsigned NOT NULL COMMENT '被处理用户ID',
  `admin_id` bigint unsigned NOT NULL COMMENT '操作管理员ID',
  `sanction_type` enum('WARNING','MUTE','BAN','UNBAN') NOT NULL COMMENT '治理类型',
  `reason` varchar(512) DEFAULT NULL COMMENT '处理原因',
  `start_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `end_at` datetime DEFAULT NULL COMMENT '结束时间',
  `status` enum('ACTIVE','EXPIRED','REVOKED') NOT NULL DEFAULT 'ACTIVE' COMMENT '记录状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `fk_user_sanctions_admin` (`admin_id`),
  KEY `idx_user_sanctions_user_id` (`user_id`),
  KEY `idx_user_sanctions_type_status` (`sanction_type`,`status`),
  CONSTRAINT `fk_user_sanctions_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_sanctions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户治理记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `student_no` varchar(32) NOT NULL COMMENT '学号',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希',
  `nickname` varchar(64) NOT NULL COMMENT '昵称',
  `avatar_url` varchar(512) DEFAULT NULL COMMENT '头像URL',
  `email` varchar(128) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(32) DEFAULT NULL COMMENT '手机号',
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER' COMMENT '用户角色：普通用户/管理员',
  `status` enum('NORMAL','MUTED','BANNED','DELETED') NOT NULL DEFAULT 'NORMAL' COMMENT '账号状态',
  `mute_until` datetime DEFAULT NULL COMMENT '禁言截止时间',
  `bio` varchar(255) DEFAULT NULL COMMENT '个人简介',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',
  `review_status` varchar(32) NOT NULL DEFAULT 'APPROVED',
  `student_card_url` varchar(512) DEFAULT NULL,
  `review_reject_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_no` (`student_no`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 20:40:10
