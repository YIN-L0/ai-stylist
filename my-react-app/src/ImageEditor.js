import React, { useState, useRef, useCallback } from 'react';
import { Modal, Button, Slider, Typography, message } from 'antd';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const { Text } = Typography;

const ImageEditor = ({ visible, image, onSave, onCancel }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
    aspect: 3/4
  });
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCompletedCrop(crop);
  }, []);

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = crop.width * scaleX * pixelRatio;
    canvas.height = crop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop]);

  const handleSave = async () => {
    if (!completedCrop) {
      message.error('请先选择裁剪区域');
      return;
    }

    try {
      const croppedImageBlob = await generateCroppedImage();
      if (croppedImageBlob) {
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
        onSave(croppedImageUrl, croppedImageBlob);
        message.success('图片编辑完成！');
      }
    } catch (error) {
      console.error('Error saving cropped image:', error);
      message.error('保存图片失败，请重试');
    }
  };

  const handleReset = () => {
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10,
      aspect: 3/4
    });
    setCompletedCrop();
    setScale(1);
    setRotate(0);
  };

  if (!image) return null;

  return (
    <Modal
      open={visible}
      title="编辑图片"
      width="90%"
      style={{ maxWidth: '800px' }}
      centered
      footer={[
        <Button key="reset" icon={<UndoOutlined />} onClick={handleReset}>
          重置
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          disabled={!completedCrop}
        >
          保存
        </Button>,
      ]}
      onCancel={onCancel}
      destroyOnClose
    >
      <div className="image-editor">
        <div className="editor-controls">
          <div className="control-group">
            <Text strong>缩放: </Text>
            <Slider
              min={0.5}
              max={3}
              step={0.1}
              value={scale}
              onChange={setScale}
              style={{ width: '150px', margin: '0 16px' }}
            />
            <Text>{scale.toFixed(1)}x</Text>
          </div>
          <div className="control-group">
            <Text strong>旋转: </Text>
            <Slider
              min={-180}
              max={180}
              step={90}
              value={rotate}
              onChange={setRotate}
              style={{ width: '150px', margin: '0 16px' }}
            />
            <Text>{rotate}°</Text>
          </div>
        </div>
        
        <div className="crop-container">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={onCropComplete}
            aspect={3/4}
            minWidth={50}
            minHeight={50}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={image}
              style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                maxWidth: '100%',
                maxHeight: '60vh',
              }}
              onLoad={() => {
                if (!crop && imgRef.current) {
                  const { width, height } = imgRef.current;
                  const newCrop = {
                    unit: 'px',
                    width: Math.min(width * 0.8, 300),
                    height: Math.min(height * 0.8, 400),
                    x: width * 0.1,
                    y: height * 0.1,
                    aspect: 3/4
                  };
                  setCrop(newCrop);
                }
              }}
            />
          </ReactCrop>
        </div>
        
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </Modal>
  );
};

export default ImageEditor; 