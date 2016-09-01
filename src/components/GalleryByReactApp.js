/*'use strict';*/

var React = require('react/addons');

// CSS
require('normalize.css');
require('../styles/main.scss');
//引入图片信息的json格式
var imageDatas = require('../data/imagDatas.json');
function genImageURL(imageDatasArr){
	for(var i = 0, j = imageDatasArr.length; i < j; i++){
		var singleImageData = imageDatasArr[i];
		singleImageData.imageURL = require('../images/' + singleImageData.fileName);
		imageDatasArr[i] = singleImageData;
	}
	return imageDatasArr;
}
imageDatas = genImageURL(imageDatas);
/*获取区间内的一个随机值*/
function getRangeRandom(low, high){
	return Math.ceil(Math.random() * (high - low) + low);
}
//获取一个0到30度之间的随机角度
function get30degRandom(){
	return (Math.random() < 0.5 ? '-' : '') + Math.floor(Math.random() * 30);
}
var ImgFigure = React.createClass({
	handleClick: function(e){
		if (this.props.arrange.isCenter) {/*this.props.arrange.isCenter这里和this.props.inverse()理解上产生冲突*/
			this.props.inverse();  /*this.props.arrange和this.props.center()是平级的，只是数据存放的位置不同*/
		}else{
			this.props.center();
		}
		e.stopPropagation();
		e.preventDefault();
	},
	render: function(){
		var styleObj = {};
		//如果props属性中指定了这张图片的位置
		if (this.props.arrange.pos) {
			styleObj = this.props.arrange.pos;
		}
		//如果图片的旋转角度有值，并且不为0，添加旋转角度，这里主要是引用已经生成的
		/*ImgFigures的state的值  此处少了一个判断条件，把第一个居中的图片也加了行内样式，导致样式表的样式无法起作用，查了好久
		原因在于，不理解这里的render是每张图片都要走一次的*/
		if (this.props.arrange.rotate) {
				['-moz-', '-ms-', '-webkit-', ''].forEach(function(value){
				styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
			}.bind(this));
		}else{
			styleObj.zIndex = 11;
		}
		/*以下是组件与css文件的交互通讯*/
		 var imgFigureClassName = 'img-figure';
		imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : ' ';/*此处注意空格*/
		return (
			<figure className={imgFigureClassName} onClick={this.handleClick} style={styleObj}>
				<img src={this.props.data.imageURL} alt={this.props.data.title}
				/>
				<figcaption>
					<h2 className="img-title">{this.props.data.title}</h2>
					<div className="img-back" onClick={this.handleClick}>
				<p>
					{this.props.data.desc}
					</p>
					</div>
				</figcaption>
			</figure>
			);
	}
});
var GalleryByReactApp = React.createClass({
	Constand: {
		centerPos: {
			left: 0,
			right: 0
		},
		hPosRange: {//水平方向的取值范围
			leftSecX: [0, 0],
			rightSecX: [0, 0],
			y: [0, 0]
		},
		vPosRange: { //垂值方向的取值范围
			x: [0, 0],
			topY: [0, 0]
		}
	},
	/*
	*居中函数
	*param index 要居中的图片的序号
	*这里还是利用闭包，返回一个函数
	*
	*/
	center: function(index){
		return function(){
			this.rearrange(index);
		}.bind(this);
	},


	/*
	*翻转函数
	*@param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
	*return {Function}这是一个闭包，其内return 一个真正等待被执行的函数
	*/
	inverse: function(index){
		return function(){
			var imgsArrangeArr = this.state.imgsArrangeArr;
			imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
			this.setState({
				imgsArrangeArr: imgsArrangeArr
			});
		}.bind(this);


	},
	/*
	*重新布局所有图片的函数
	*@param centerIndex 指定居中排布那个图片
	*/
	rearrange: function(centerIndex){
		/*先读取现在的位置信息主要作用是修改源数据的位置信息，重新写回源数据中备用*/
		var imgsArrangeArr = this.state.imgsArrangeArr,
		Constand = this.Constand,
		centerPos = Constand.centerPos,
		hPosRange = Constand.hPosRange,
		vPosRange = Constand.vPosRange,
		/*把大对象拆分成小对象，方便精准修改*/
		hposrangeLeftSecX = hPosRange.leftSecX,
		hposrangeRightSecX = hPosRange.rightSecX,
		hPosRangeY = hPosRange.y,
		vPosRangeTopY = vPosRange.topY,
		vPosRangeX = vPosRange.x,
		/*用来存放位于上分区的图片序号数组，方便排除这个数组内的图片给左右分区排布*/
		imgsArrangeTopArr = [],
		//上侧取一个或不取都可以，随机
		topImgNum = Math.floor(Math.random() * 2),
		/*标注布局在上面的图片是从数组的什么位置取出的，临时标注为0*/
		topImgSpliceIndex = 0,/*占位作用*/
		imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);/*splice用两个参数，相当于删除并返回*/
		//首先居中 centerIndex的图片，第一次初化是0，也就是0替换成0，因此用被删除的也是可以的，后面才更改
		imgsArrangeCenterArr[0].pos = centerPos;/*imgsArrangeCenterArr不断增加，这里只取第一个*/
		imgsArrangeCenterArr[0].rotate = 0;
		imgsArrangeCenterArr[0].isCenter = true;
		//取出要布局上侧的图片的状态信息 随机取出序号
		topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
		imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);//让原数组中删除被选的序号
		//布局位于上侧的图片
		imgsArrangeTopArr.forEach(function(value, index){
			imgsArrangeTopArr[index] = {
				pos: {
					top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
					left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
				},
				rotate: get30degRandom(),
				isCenter: false
			};

		});
		//布局左右两侧的图片
		for(var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++){
			var hPosRangeLORX = null;
			if (i < k) {
				hPosRangeLORX = hposrangeLeftSecX;
			}else{
				hPosRangeLORX = hposrangeRightSecX;
			}
			imgsArrangeArr[i] = {
					pos: {top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
					left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
				},
				rotate: get30degRandom(),
				isCenter: false
			};
		}
		if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
			imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
		}
		imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);//合并数据

		this.setState({
			imgsArrangeArr: imgsArrangeArr//重新新回
		});


	},
	getInitialState: function(){
		return {
			imgsArrangeArr: [/*存放位置信息的仓库子组件由arrange读取，由render初始化*/

			]
		};
	},
	//组件加载以后，为每张图片计算其位置的范围
	componentDidMount: function(){
		//首先拿到舞台的大小,也就是宽高
		var stageDOM = React.findDOMNode(this.refs.stage),
		stageW = stageDOM.scrollWidth,
		stageH = stageDOM.scrollHeight,
		halfStageW = Math.ceil(stageW / 2),
		halfStageH = Math.ceil(stageH / 2);
		//拿到一个imageFigure的大小
		var imgFigureDOM = React.findDOMNode(this.refs.ImgFigure0),
		imgW = imgFigureDOM.scrollWidth,
		imgH = imgFigureDOM.scrollHeight,
		halfImgW = Math.ceil(imgW / 2),
		halfImgH = Math.ceil(imgH / 2);
	/*计算每张图片的位置  计算中心图片的位置点*/
		this.Constand.centerPos = {
		left: halfStageW - halfImgW,
		top: halfStageH - halfImgH};
	//水平方向 左侧和右侧上限和下限的取值范围
	this.Constand.hPosRange.leftSecX[0] = -halfImgW;
	this.Constand.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
	this.Constand.hPosRange.rightSecX[0] = halfStageW + halfImgW;
	this.Constand.hPosRange.rightSecX[1] = stageW - halfImgW;
	this.Constand.hPosRange.y[0] = -halfImgH;
	this.Constand.hPosRange.y[1] = stageH - halfImgH;

	//上侧区域的取值范围
	this.Constand.vPosRange.topY[0] = -halfImgH;
	this.Constand.vPosRange.topY[1] = halfStageH - halfImgH * 3;
	this.Constand.vPosRange.x[0] = halfImgW - imgW;
	this.Constand.vPosRange.x[1] = halfStageW;
	//调用重新排布函数，让第一张居中排布
                        this.rearrange(0);




	},

render: function() {
	var controllerUnits = [],
	ImgFigures = [];
	imageDatas.forEach(function(value, index){   /*此处的作用是初始化原始数据*/
		if(!this.state.imgsArrangeArr[index]){
			this.state.imgsArrangeArr[index] = {
				pos: {
					left: 0,
					top: 0
				},
				rotate: 0,
				isInverse: false,
				isCenter: false
			};
		}
		ImgFigures.push(<ImgFigure data={value} ref = {'ImgFigure' + index} center = {this.center(index)} inverse = {this.inverse(index)} arrange = {this.state.imgsArrangeArr[index]} />);
	}.bind(this));
    return (
      <section className="stage" ref="stage">
          <section className="img-sec">
          {ImgFigures}
          </section>
          <nav className="controller-nav">
          {controllerUnits}
          </nav>
      </section>
    );
  }
});
React.render(<GalleryByReactApp />, document.getElementById('content')); // jshint ignore:line

module.exports = GalleryByReactApp;
