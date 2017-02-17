<?php
/**
 * 根据路由或内容返回图片的长和宽处理类
 * Created by PhpStorm.
 * User: chendongdong
 * Date: 2016/7/30
 * Time: 20:26
 */
namespace Common\Service;

class GetImgSizeService {
    /**
     * false 代表传入的是内容 true代表传入的地址
     * @var bool
     */
    protected $type;

    /**
     * 一段包含图片地址的内容
     * @var string
     */
    protected $content;

    /**
     * 有ueditor有拉伸改变大小的图片正则表达式
     */
    const CHANGE_IMG_PATTERN = '/<img[^>]+(src)=(["|\']?)([^ "\'>]+\.(gif|jpg|jpeg|bmp|png))\2[^>]+width\s*=([\'|"])(\d+)\5[^>]*height\s*=([\'|"])(\d+)\7[^>]+\/>/';

    /**
     * 原始图片的大小
     */
    const CURREN_PATTERN = "/(src)=([\"|']?)([^ \"'>]+\.(gif|jpg|jpeg|bmp|png))\\2/i";

    public function __construct($content = null, $type = false)
    {
        $this->content = $content;
        $this->type = $type;
    }

    /**
     * 获取图片的大小（传入url或是文本文字）
     * @return array
     */
    public function fetchImgSize()
    {
        if ($this->type === false){
            return $this->getPicUrlByContent();
        }else{
            return self::getSizeByUrl($this->content);
        }
    }

    /**
     * 获取图片大小
     * @param $url
     * @return array
     */
    public static function getSizeByUrl($url)
    {
        $urls = is_array($url)? $url:[$url];
        $imgSizes = [];
        foreach ($urls as $item){

            // $imgInfo = getImageSize(static::addFullImgUrl($item));
            $url = static::addFullImgUrl($item); 
            $res = static::myGetImageSize($url);

            $imgSize = [
                'imgurl'=>$item,
                'width'=>$res['width'],
                'height'=>$res['height']
            ];
            $imgSizes[] = $imgSize;
        }
        return $imgSizes;
    }

    /**
     * 获取内容中的图片大小
     * @return array
     */
    protected function getPicUrlByContent(){
        $changeImgSize = [];
        if (!preg_match_all('/<img[^>]+>/i', $this->content, $matches)) {
            return [];
        }
        foreach (current($matches) as $item) {
            //被拉伸的匹配带有width的img并获取宽和高
            if (preg_match(self::CHANGE_IMG_PATTERN, $item, $match)) {
                $changeImgSize[] = ['imgurl' =>$match['3'], 'width' => $match[6], 'height' => $match[8]];
                continue;
            }
            //原图片匹配通过getImageSize方法获取宽和高
            if(preg_match(self::CURREN_PATTERN, $item, $matches)) {
                $changeImgSize = array_merge($changeImgSize, static::getSizeByUrl($matches[3]));
            }
        }
        return $changeImgSize;
    }

    public function setContent($content) {
        $this->content = $content;
    }

    public function setType($type) {
        $this->type = $type;
    }

    /**
     * 获取绝对路径的url
     * @param $url 传入的url
     * @return string
     */
    public static function addFullImgUrl($url) {
        if (strpos($url,'http') === false) {
            $url = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER[HTTP_HOST] . $url;
        }
        return $url;
    }

    /** 
     * 获取远程图片的宽高和体积大小 
     * 
     * @param string $url 远程图片的链接 
     * @param string $type 获取远程图片资源的方式, 默认为 curl 可选 fread 
     * @param boolean $isGetFilesize 是否获取远程图片的体积大小, 默认false不获取, 设置为 true 时 $type 将强制为 fread  
     * @return false|array 
     */  
    public static function myGetImageSize($url, $type = 'curl', $isGetFilesize = false)   
    {  
        // 若需要获取图片体积大小则默认使用 fread 方式  
        $type = $isGetFilesize ? 'fread' : $type;  
       
         if ($type == 'fread') {  
            // 或者使用 socket 二进制方式读取, 需要获取图片体积大小最好使用此方法  
            $handle = fopen($url, 'rb');  
       
            if (! $handle) return false;  
       
            // 只取头部固定长度168字节数据  
            $dataBlock = fread($handle, 168);  
        }  
        else {  
            // 据说 CURL 能缓存DNS 效率比 socket 高  
            $ch = curl_init($url);  
            // 超时设置  
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);  
            // 取前面 168 个字符 通过四张测试图读取宽高结果都没有问题,若获取不到数据可适当加大数值  
            curl_setopt($ch, CURLOPT_RANGE, '0-167');  
            // 跟踪301跳转  
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);  
            // 返回结果  
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  
       
            $dataBlock = curl_exec($ch);  
       
            curl_close($ch);  
       
            if (! $dataBlock) return false;  
        }  
       
        // 将读取的图片信息转化为图片路径并获取图片信息,经测试,这里的转化设置 jpeg 对获取png,gif的信息没有影响,无须分别设置  
        // 有些图片虽然可以在浏览器查看但实际已被损坏可能无法解析信息   
        $size = getimagesize('data://image/jpeg;base64,'. base64_encode($dataBlock));  
        if (empty($size)) {  
            return false;  
        }  
       
        $result['width'] = $size[0];  
        $result['height'] = $size[1];  
       
        // 是否获取图片体积大小  
        if ($isGetFilesize) {  
            // 获取文件数据流信息  
            $meta = stream_get_meta_data($handle);  
            // nginx 的信息保存在 headers 里，apache 则直接在 wrapper_data   
            $dataInfo = isset($meta['wrapper_data']['headers']) ? $meta['wrapper_data']['headers'] : $meta['wrapper_data'];  
       
            foreach ($dataInfo as $va) {  
                if ( preg_match('/length/iU', $va)) {  
                    $ts = explode(':', $va);  
                    $result['size'] = trim(array_pop($ts));  
                    break;  
                }  
            }  
        }  
       
        if ($type == 'fread') fclose($handle);  
       
        return $result;  
    }  


}