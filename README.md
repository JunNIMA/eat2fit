# Eat2Fit 健康生活解决方案

Eat2Fit是一个集健身训练与营养饮食于一体的健康生活平台，旨在为用户提供个性化的健康解决方案。

## 项目定位与目标

### 核心理念
将"科学健身"与"营养饮食"相结合，提供一站式健康生活解决方案，助力用户实现身心健康与生活品质的全面提升。

### 目标用户
- 健身爱好者
- 减脂/增肌人群
- 亚健康白领
- 健康生活追求者

### 项目目标
- 为用户量身打造个性化的健身训练和饮食搭配计划
- 科普健康生活理念，提升用户自我管理意识
- 构建一个集知识、工具、社群于一体的健康生活生态平台

## 功能设计

### 1. 健身模块
- 健身目标设定（增肌 / 减脂 / 塑形 / 维持状态）
- 视频课程推荐（按目标、部位、难度分类）
- 打卡记录与训练日历统计
- 动作指导与受伤预防提醒（图文+视频）
- 智能训练计划推荐（支持 AI 个性化生成）

### 2. 饮食模块
- 健康食谱推荐（搭配训练目标自动调整营养结构）
- 营养成分分析（卡路里、蛋白质、脂肪、碳水等）
- 饮食计划制定与训练进度联动
- 用户上传健康食谱、饮食经验分享

## 技术架构

项目采用微服务架构，主要包含以下模块：

- **eat2fit-gateway**: 网关服务，负责请求路由、鉴权等功能
- **eat2fit-common**: 公共模块，提供通用工具类和服务
- **eat2fit-user**: 用户服务，处理用户注册、登录、信息管理等
- **eat2fit-fitness**: 健身服务，提供训练计划、课程管理等功能
- **eat2fit-diet**: 饮食服务，提供营养计划、食谱管理等功能
- **eat2fit-ai**: AI服务，基于Spring AI提供个性化推荐功能

## 技术选型

### 后端技术
- Spring Boot 3.2.0
- Spring Cloud 2023.0.0
- Spring Cloud Alibaba 2022.0.0.0
- MyBatis Plus 3.5.3.2
- MySQL 8.0
- Redis
- Spring AI

### 前端技术
- React + Tailwind CSS
- React Native / uni-app (移动端)
- ECharts (数据可视化)

## 快速开始

### 环境要求
- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+
- Nacos 2.2.0+

### 本地运行
1. 克隆代码仓库
   ```bash
   git clone https://github.com/your-username/eat2fit.git
   ```

2. 编译项目
   ```bash
   mvn clean package
   ```

3. 启动服务
   ```bash
   # 依次启动各个服务
   java -jar eat2fit-gateway/target/eat2fit-gateway.jar
   java -jar eat2fit-user/target/eat2fit-user.jar
   java -jar eat2fit-fitness/target/eat2fit-fitness.jar
   java -jar eat2fit-diet/target/eat2fit-diet.jar
   java -jar eat2fit-ai/target/eat2fit-ai.jar
   ```

## 项目结构
```
eat2fit
├── eat2fit-gateway      # 网关服务
├── eat2fit-common       # 公共模块
├── eat2fit-user         # 用户服务
├── eat2fit-fitness      # 健身服务
├── eat2fit-diet         # 饮食服务
└── eat2fit-ai           # AI服务
```

## 贡献指南
欢迎提交 Issue 或 Pull Request 来帮助改进项目。

## 许可证
本项目采用 [MIT 许可证](LICENSE)。 