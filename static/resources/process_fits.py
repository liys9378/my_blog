#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
天文FITS图像处理脚本

这个脚本演示了如何使用Astropy和其他Python库处理天文FITS图像，
包括基本的图像处理、源检测和测光分析。

作者: 天文技术博客
日期: 2023-05-15
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from astropy.io import fits
from astropy.stats import sigma_clipped_stats
from astropy.visualization import SqrtStretch, ImageNormalize
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
from astropy import units as u
from photutils.detection import DAOStarFinder
from photutils.aperture import CircularAperture, aperture_photometry


def load_fits_image(file_path):
    """
    加载FITS图像文件并返回数据和头信息
    
    参数:
        file_path (str): FITS文件路径
        
    返回:
        tuple: (图像数据, 头信息)
    """
    try:
        with fits.open(file_path) as hdul:
            # 打印文件信息
            print("FITS文件信息:")
            hdul.info()
            
            # 获取主图像数据和头信息
            data = hdul[0].data
            header = hdul[0].header
            
            # 打印一些关键头信息
            print("\n图像尺寸:", data.shape)
            if 'TELESCOP' in header:
                print("望远镜:", header['TELESCOP'])
            if 'INSTRUME' in header:
                print("仪器:", header['INSTRUME'])
            if 'FILTER' in header:
                print("滤镜:", header['FILTER'])
            if 'EXPTIME' in header:
                print(f"曝光时间: {header['EXPTIME']} 秒")
            
            return data, header
    except Exception as e:
        print(f"加载FITS文件时出错: {e}")
        return None, None


def preprocess_image(data):
    """
    预处理图像：去除坏像素和背景估计
    
    参数:
        data (ndarray): 图像数据
        
    返回:
        ndarray: 预处理后的图像
    """
    # 替换NaN值
    data = np.nan_to_num(data)
    
    # 计算背景统计
    mean, median, std = sigma_clipped_stats(data, sigma=3.0)
    print(f"\n背景统计: 均值={mean:.2f}, 中值={median:.2f}, 标准差={std:.2f}")
    
    # 背景减除
    data_processed = data - median
    
    return data_processed, median, std


def detect_sources(data, background_std, threshold=5.0):
    """
    使用DAOStarFinder检测图像中的源
    
    参数:
        data (ndarray): 图像数据
        background_std (float): 背景标准差
        threshold (float): 检测阈值（背景标准差的倍数）
        
    返回:
        Table: 检测到的源表
    """
    # 使用DAOStarFinder检测源
    daofind = DAOStarFinder(fwhm=3.0, threshold=threshold * background_std)
    sources = daofind(data)
    
    if sources is None or len(sources) == 0:
        print("未检测到源")
        return None
    
    print(f"\n检测到 {len(sources)} 个源")
    print(sources[:10])  # 打印前10个源
    
    return sources


def perform_photometry(data, sources):
    """
    对检测到的源进行孔径测光
    
    参数:
        data (ndarray): 图像数据
        sources (Table): 检测到的源表
        
    返回:
        Table: 测光结果
    """
    positions = np.transpose((sources['xcentroid'], sources['ycentroid']))
    apertures = CircularAperture(positions, r=5.0)
    
    # 执行孔径测光
    phot_table = aperture_photometry(data, apertures)
    
    print("\n测光结果:")
    print(phot_table[:10])  # 打印前10个结果
    
    return phot_table


def plot_image_with_sources(data, sources, output_path=None):
    """
    绘制图像并标记检测到的源
    
    参数:
        data (ndarray): 图像数据
        sources (Table): 检测到的源表
        output_path (str, optional): 输出图像路径
    """
    # 创建图像归一化对象
    norm = ImageNormalize(data, stretch=SqrtStretch())
    
    plt.figure(figsize=(10, 8))
    plt.imshow(data, cmap='viridis', origin='lower', norm=norm)
    plt.colorbar(label='Flux')
    
    # 标记检测到的源
    if sources is not None:
        positions = np.transpose((sources['xcentroid'], sources['ycentroid']))
        apertures = CircularAperture(positions, r=10.0)
        apertures.plot(color='red', lw=1.5, alpha=0.7)
    
    plt.title('天文图像与检测到的源')
    plt.tight_layout()
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"\n图像已保存至: {output_path}")
    
    plt.show()


def analyze_wcs(header):
    """
    分析WCS信息并转换坐标
    
    参数:
        header (Header): FITS头信息
    """
    try:
        wcs = WCS(header)
        print("\nWCS信息:")
        print(wcs)
        
        # 图像中心的像素坐标
        center_x = header['NAXIS1'] // 2
        center_y = header['NAXIS2'] // 2
        
        # 转换为天球坐标
        center_sky = wcs.pixel_to_world(center_x, center_y)
        print(f"\n图像中心坐标: {center_sky.to_string('hmsdms')}")
        print(f"赤经: {center_sky.ra.deg:.6f} 度")
        print(f"赤纬: {center_sky.dec.deg:.6f} 度")
        
        # 计算图像视场
        corner1 = wcs.pixel_to_world(0, 0)
        corner2 = wcs.pixel_to_world(header['NAXIS1']-1, header['NAXIS2']-1)
        separation = corner1.separation(corner2)
        print(f"\n图像对角线视场: {separation.deg:.2f} 度 ({separation.arcmin:.2f} 角分)")
        
    except Exception as e:
        print(f"\n分析WCS信息时出错: {e}")


def main(fits_file):
    """
    主函数
    
    参数:
        fits_file (str): FITS文件路径
    """
    print(f"处理文件: {fits_file}")
    
    # 加载FITS图像
    data, header = load_fits_image(fits_file)
    if data is None:
        return
    
    # 预处理图像
    data_processed, _, std = preprocess_image(data)
    
    # 检测源
    sources = detect_sources(data_processed, std)
    
    # 执行测光
    if sources is not None:
        phot_table = perform_photometry(data_processed, sources)
    
    # 分析WCS信息
    if header is not None:
        analyze_wcs(header)
    
    # 绘制图像并标记源
    output_dir = os.path.dirname(fits_file)
    base_name = os.path.splitext(os.path.basename(fits_file))[0]
    output_path = os.path.join(output_dir, f"{base_name}_sources.png")
    plot_image_with_sources(data_processed, sources, output_path)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='处理天文FITS图像')
    parser.add_argument('fits_file', help='FITS文件路径')
    args = parser.parse_args()
    
    main(args.fits_file)