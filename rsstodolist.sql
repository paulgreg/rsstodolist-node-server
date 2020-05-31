-- Host: localhost    Database: rsstodolist
-- ------------------------------------------------------
-- Server version       10.3.22-MariaDB-0+deb10u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS rsstodolist;
use rsstodolist;

DROP TABLE IF EXISTS `feeds_feedentry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feeds_feedentry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `url` varchar(512) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `creation_date` datetime NOT NULL,
  `description` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11333 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


/* Migration from rsstodoliset-server */
ALTER TABLE feeds_feedentry
CHANGE COLUMN `creation_date` createdAt DATETIME;

ALTER TABLE feeds_feedentry
ADD COLUMN updatedAt DATETIME();

ALTER TABLE feeds_feedentry
MODIFY url varchar(512) NOT NULL;
