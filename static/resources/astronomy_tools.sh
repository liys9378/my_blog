#!/bin/bash

# 天文数据处理工具集
# 这个脚本提供了一系列用于天文数据处理的命令行工具
# 作者: 天文技术博客
# 日期: 2023-05-20

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # 无颜色

# 显示星空图标
show_banner() {
    echo -e "${BLUE}"
    echo "  *       *       *   *   *      *     *   "
    echo " *   *  ${YELLOW}*${BLUE}   *    *     *  ${YELLOW}*${BLUE}    *     *  "
    echo "*     *     *  ${YELLOW}*${BLUE}   *    *     *  ${YELLOW}*${BLUE}    * "
    echo " *  ${YELLOW}*${BLUE}   *     *    *  ${YELLOW}*${BLUE}   *     *    *  "
    echo "  *       *       *   *   *      *     *   "
    echo -e "${YELLOW}=========================================${NC}"
    echo -e "${CYAN}       天文数据处理工具集 v1.0${NC}"
    echo -e "${YELLOW}=========================================${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}检查依赖...${NC}"
    
    local missing_deps=0
    local deps=("python3" "pip" "wget" "curl")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${RED}未找到 $dep${NC}"
            missing_deps=1
        else
            echo -e "${GREEN}✓ 找到 $dep$(command -v "$dep")${NC}"
        fi
    done
    
    # 检查Python包
    local py_deps=("astropy" "numpy" "matplotlib")
    for dep in "${py_deps[@]}"; do
        if ! python3 -c "import $dep" &> /dev/null; then
            echo -e "${YELLOW}警告: Python包 '$dep' 未安装${NC}"
            echo -e "  可以使用 '${CYAN}pip install $dep${NC}' 安装"
        else
            echo -e "${GREEN}✓ 找到Python包 $dep${NC}"
        fi
    done
    
    if [ $missing_deps -eq 1 ]; then
        echo -e "\n${RED}请安装缺失的依赖后再运行此脚本${NC}"
        return 1
    fi
    
    echo -e "\n${GREEN}所有基本依赖已满足!${NC}\n"
    return 0
}

# 下载示例数据
download_sample_data() {
    echo -e "${BLUE}下载示例天文数据...${NC}"
    
    local data_dir="./astronomy_data"
    mkdir -p "$data_dir"
    
    echo -e "${YELLOW}数据将被下载到: ${CYAN}$data_dir${NC}"
    
    # 下载示例FITS文件 (这里使用NASA的公开数据)
    local fits_url="https://fits.gsfc.nasa.gov/samples/WFPC2ASSNu5780205bx.fits"
    local fits_file="$data_dir/sample_hubble.fits"
    
    echo -e "\n${PURPLE}下载Hubble WFPC2示例图像...${NC}"
    if [ -f "$fits_file" ]; then
        echo -e "${YELLOW}文件已存在: $fits_file${NC}"
    else
        echo -e "${CYAN}从 $fits_url 下载...${NC}"
        wget -q --show-progress "$fits_url" -O "$fits_file"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}下载完成: $fits_file${NC}"
        else
            echo -e "${RED}下载失败${NC}"
        fi
    fi
    
    echo -e "\n${GREEN}示例数据准备完成!${NC}\n"
}

# 显示FITS文件头信息
show_fits_header() {
    if [ -z "$1" ]; then
        echo -e "${RED}错误: 未指定FITS文件${NC}"
        echo -e "用法: $0 header <fits_file>${NC}"
        return 1
    fi
    
    if [ ! -f "$1" ]; then
        echo -e "${RED}错误: 文件不存在: $1${NC}"
        return 1
    fi
    
    echo -e "${BLUE}显示FITS文件头信息: ${CYAN}$1${NC}\n"
    
    # 使用Python和Astropy显示头信息
    python3 -c "from astropy.io import fits; hdul = fits.open('$1'); print(repr(hdul[0].header))" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}错误: 无法读取FITS头信息。请确保已安装astropy并且文件格式正确。${NC}"
        return 1
    fi
    
    echo -e "\n${GREEN}头信息显示完成${NC}"
}

# 转换FITS为PNG
convert_fits_to_png() {
    if [ -z "$1" ]; then
        echo -e "${RED}错误: 未指定FITS文件${NC}"
        echo -e "用法: $0 convert <fits_file> [output_png]${NC}"
        return 1
    fi
    
    if [ ! -f "$1" ]; then
        echo -e "${RED}错误: 文件不存在: $1${NC}"
        return 1
    fi
    
    local input_file="$1"
    local output_file="${2:-${input_file%.fits}.png}"
    
    echo -e "${BLUE}转换FITS为PNG: ${CYAN}$input_file${NC} -> ${CYAN}$output_file${NC}\n"
    
    # 使用Python和Matplotlib转换
    python3 - <<EOF
try:
    import numpy as np
    import matplotlib.pyplot as plt
    from astropy.io import fits
    from astropy.visualization import astropy_mpl_style, ZScaleInterval
    
    plt.style.use(astropy_mpl_style)
    
    # 打开FITS文件
    hdul = fits.open('$input_file')
    image_data = hdul[0].data
    
    # 处理多维数据
    if image_data.ndim > 2:
        print("检测到多维数据，使用第一个平面")
        image_data = image_data[0]
    
    # 使用ZScale进行图像缩放
    interval = ZScaleInterval()
    vmin, vmax = interval.get_limits(image_data)
    
    # 创建图像
    plt.figure(figsize=(10, 8))
    plt.imshow(image_data, cmap='viridis', origin='lower', vmin=vmin, vmax=vmax)
    plt.colorbar(label='Flux')
    plt.title('$input_file')
    plt.tight_layout()
    
    # 保存为PNG
    plt.savefig('$output_file', dpi=300, bbox_inches='tight')
    print("转换成功: $output_file")
    
    hdul.close()
except Exception as e:
    print(f"错误: {e}")
    exit(1)
EOF
    
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}转换失败${NC}"
        return 1
    fi
    
    echo -e "\n${GREEN}转换完成: $output_file${NC}"
}

# 显示基本的天文计算
show_astro_calc() {
    echo -e "${BLUE}天文计算工具${NC}\n"
    
    # 使用Python和Astropy进行计算
    python3 - <<EOF
try:
    from astropy import units as u
    from astropy.time import Time
    from astropy.coordinates import SkyCoord, EarthLocation, AltAz
    import numpy as np
    from datetime import datetime, timedelta
    
    # 当前时间
    now = Time.now()
    print(f"当前时间: {now.iso}")
    
    # 转换为儒略日和修正儒略日
    print(f"儒略日: {now.jd:.6f}")
    print(f"修正儒略日: {now.mjd:.6f}")
    
    # 一些著名天体的坐标
    objects = {
        "天狼星": SkyCoord(ra=101.2874*u.deg, dec=-16.7161*u.deg),
        "织女星": SkyCoord(ra=279.2347*u.deg, dec=38.7837*u.deg),
        "大角星": SkyCoord(ra=95.9879*u.deg, dec=-52.6958*u.deg),
        "北河三": SkyCoord(ra=279.2347*u.deg, dec=-8.2016*u.deg),
        "参宿四": SkyCoord(ra=88.7929*u.deg, dec=7.4069*u.deg),
    }
    
    print("\n著名恒星坐标:")
    for name, coord in objects.items():
        print(f"{name}: {coord.to_string('hmsdms')}")
    
    # 计算天体间角距离
    print("\n天体间角距离:")
    print(f"天狼星-参宿四: {objects['天狼星'].separation(objects['参宿四']).deg:.2f}°")
    print(f"织女星-北河三: {objects['织女星'].separation(objects['北河三']).deg:.2f}°")
    
    # 假设观测位置在北京
    location = EarthLocation(lat=39.9042*u.deg, lon=116.4074*u.deg, height=50*u.m)
    print(f"\n观测位置: 北京 (经度: 116.4074°, 纬度: 39.9042°)")
    
    # 计算当前天体高度角和方位角
    time = Time.now()
    altaz = AltAz(obstime=time, location=location)
    print("\n当前天体位置 (高度角/方位角):")
    for name, coord in objects.items():
        altaz_coord = coord.transform_to(altaz)
        alt = altaz_coord.alt.deg
        az = altaz_coord.az.deg
        if alt > 0:
            visibility = "可见"
        else:
            visibility = "不可见"
        print(f"{name}: 高度角={alt:.1f}°, 方位角={az:.1f}°, {visibility}")
    
    # 计算月相
    def moon_phase(date):
        """简单的月相计算 (0=新月, 0.5=满月, 0.99=新月前)"""
        date = Time(date)
        # 2000年1月6日是新月
        ref_new_moon = Time('2000-01-06')
        # 朔望月平均周期
        synodic_month = 29.530588853 * u.day
        # 计算自参考新月以来的月数
        months = (date - ref_new_moon) / synodic_month
        # 取小数部分作为月相
        phase = months.value % 1.0
        return phase
    
    phase = moon_phase(time)
    print(f"\n当前月相: {phase:.2f}")
    if phase < 0.05 or phase > 0.95:
        print("新月")
    elif 0.05 <= phase < 0.20:
        print("娥眉月")
    elif 0.20 <= phase < 0.30:
        print("上弦月")
    elif 0.30 <= phase < 0.45:
        print("盈凸月")
    elif 0.45 <= phase < 0.55:
        print("满月")
    elif 0.55 <= phase < 0.70:
        print("亏凸月")
    elif 0.70 <= phase < 0.80:
        print("下弦月")
    else:
        print("残月")
    
    # 计算下一个满月和新月
    def next_phase(current_time, target_phase):
        phase = moon_phase(current_time)
        days_to_add = (target_phase - phase) % 1.0 * 29.530588853
        return current_time + days_to_add * u.day
    
    next_new_moon = next_phase(time, 0.0)
    next_full_moon = next_phase(time, 0.5)
    
    print(f"\n下一个新月: {next_new_moon.iso}")
    print(f"下一个满月: {next_full_moon.iso}")
    
except Exception as e:
    print(f"错误: {e}")
    exit(1)
EOF
    
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}计算失败${NC}"
        return 1
    fi
    
    echo -e "\n${GREEN}计算完成${NC}"
}

# 显示帮助信息
show_help() {
    echo -e "${CYAN}天文数据处理工具集${NC} - 帮助信息"
    echo -e "用法: $0 ${GREEN}[命令]${NC} ${YELLOW}[参数]${NC}"
    echo ""
    echo -e "可用命令:"
    echo -e "  ${GREEN}check${NC}       检查依赖"
    echo -e "  ${GREEN}download${NC}    下载示例天文数据"
    echo -e "  ${GREEN}header${NC}      ${YELLOW}<fits_file>${NC}    显示FITS文件头信息"
    echo -e "  ${GREEN}convert${NC}     ${YELLOW}<fits_file> [output_png]${NC}    转换FITS为PNG"
    echo -e "  ${GREEN}calc${NC}        显示基本的天文计算"
    echo -e "  ${GREEN}help${NC}        显示此帮助信息"
    echo ""
    echo -e "示例:"
    echo -e "  $0 ${GREEN}download${NC}                  # 下载示例数据"
    echo -e "  $0 ${GREEN}header${NC} ${YELLOW}astronomy_data/sample_hubble.fits${NC}    # 显示FITS头信息"
    echo -e "  $0 ${GREEN}convert${NC} ${YELLOW}astronomy_data/sample_hubble.fits${NC}    # 转换为PNG"
    echo ""
}

# 主函数
main() {
    show_banner
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    case "$1" in
        check)
            check_dependencies
            ;;
        download)
            download_sample_data
            ;;
        header)
            show_fits_header "$2"
            ;;
        convert)
            convert_fits_to_png "$2" "$3"
            ;;
        calc)
            show_astro_calc
            ;;
        help)
            show_help
            ;;
        *)
            echo -e "${RED}错误: 未知命令 '$1'${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"