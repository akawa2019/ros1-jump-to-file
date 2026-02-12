# ROS Path Jump VS Code Extension
# ROS 路径跳转 VS Code 插件

A Visual Studio Code extension to quickly jump to files using ROS-style paths like `$(find package_name)/relative/path`.  
一个 VS Code 插件，用于快速跳转 ROS 风格路径，例如 `$(find package_name)/relative/path`。

**ROS 1 only**
**仅适配于 ROS 1**

---

## Features / 功能

- Ctrl+Click on ROS-style paths to open the target file.  
  按住 Ctrl 点击 ROS 风格路径，直接打开目标文件。
- Support for custom file extensions: `.launch`, `.xacro`, `.sdf`, `.world`, etc.  
  支持自定义文件扩展名：`.launch`、`.xacro`、`.sdf`、`.world` 等。
- Persistent cache of ROS package paths for faster access.  
  持久化缓存 ROS 包路径，加快访问速度。
- User overrides take priority over auto-detected paths.  
  用户手动配置路径优先于自动检测。
- Friendly warnings and cache refresh option when a path cannot be resolved.  
  当路径无法解析时，提供友好提示和缓存刷新选项。

---

## Installation / 安装

1. Install from VS Code Marketplace or build from source.  
   从 VS Code Marketplace 安装或从源码构建。
2. Configure your ROS `setup.bash` file in settings.  
   在插件设置中配置你的 ROS `setup.bash` 文件。
3. Optionally, add custom file extensions or user package overrides.  
   可选：添加自定义文件扩展名或用户包路径覆盖。

---

## Usage / 使用方法

1. Open a file containing ROS-style paths like `$(find my_pkg)/path/to/file.launch`.  
   打开包含 ROS 风格路径的文件，例如 `$(find my_pkg)/path/to/file.launch`。
2. Hold **Ctrl** and click the path to jump to the target file.  
   按住 **Ctrl** 并点击路径即可跳转到目标文件。
3. If the package cannot be resolved, a warning will appear with a "Refresh Cache" button.  
   如果包无法解析，将出现警告，并可点击“刷新缓存”按钮。
4. Use the command palette to manually refresh the ROS package cache.  
   可以通过命令面板手动刷新 ROS 包缓存。

---

## Configuration / 配置

Settings are available under **`ros1JumpToFile`** and **`rosPathResolver`**:

- `ros1JumpToFile.setupFile`  
  Path to your ROS `setup.bash`.  
  ROS `setup.bash` 文件路径。
  
- `ros1JumpToFile.supportedExtensions`  
  Array of file extensions to scan for ROS paths. Default: `["launch","xacro","sdf","world"]`.  
  需要扫描 ROS 路径的文件扩展名数组，默认值：`["launch","xacro","sdf","world"]`。
  
- `rosPathResolver.packageOverrides`  
  Object mapping package names to custom paths. User overrides auto-detected paths.  
  包名到自定义路径的映射，用户配置优先于自动检测路径。

---

## Commands / 命令

- **ROS1 Jump To File: Refresh Cache**  
  Refresh the ROS package cache manually.  
  手动刷新 ROS 包缓存。

---

## Example / 示例

```json
"ros1JumpToFile.setupFile": "/opt/ros/noetic/setup.bash",
"ros1JumpToFile.supportedExtensions": ["launch", "xacro", "sdf", "world"],
"rosPathResolver.packageOverrides": {
    "my_package": "/home/user/my_package"
}
