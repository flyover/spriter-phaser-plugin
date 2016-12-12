Phaser.Plugin.Spriter = function(game, parent) {
  Phaser.Plugin.call(this, game, parent);
};
Phaser.Plugin.Spriter.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Spriter.prototype.constructor = Phaser.Plugin.Spriter;
Phaser.Plugin.Spriter.VERSION = "0.0.0";

Phaser.Plugin.Spriter.SpriterObject = function(game, options) {
  Phaser.Group.call(this, game);
  options = options || {};
  var json_key = options.json || '';
  var atlas_key = options.atlas || '';
  var image_key = options.image || '';
  var entity_key = options.entity || 'default';
  var anim_key = options.anim || '';
  this.spriter_data = new spriter.Data().load(game.cache.getJSON(json_key));
  this.atlas_data = new atlas.Data().importTpsText(game.cache.getText(atlas_key));
  this.images = {};
  this.images[image_key] = game.cache.getImage(image_key);
  this.spriter_pose = new spriter.Pose(this.spriter_data);
  this.spriter_pose.setEntity(entity_key);
  this.spriter_pose.setAnim(anim_key);
  if (game.renderer instanceof PIXI.WebGLRenderer) {
    //console.log("WebGL");
    var gl = game.renderer.gl;
    this.render_webgl = new RenderWebGL(gl);
    this.render_webgl.loadData(this.spriter_data, this.atlas_data, this.images);
  } else if (game.renderer instanceof PIXI.CanvasRenderer) {
    //console.log("Canvas");
    var ctx = game.renderer.context;
    this.render_ctx2d = new RenderCtx2D(ctx);
    this.render_ctx2d.loadData(this.spriter_data, this.atlas_data, this.images);
  } else {
    console.log("TODO");
  }
};
Phaser.Plugin.Spriter.SpriterObject.prototype = Object.create(Phaser.Group.prototype);
Phaser.Plugin.Spriter.SpriterObject.prototype.constructor = Phaser.Plugin.Spriter.SpriterObject;
Phaser.Plugin.Spriter.SpriterObject.prototype.destroy = function(game) {
  console.log("destroy", arguments);
  game = game || this.game;
  if (game.renderer instanceof PIXI.WebGLRenderer) {
    this.render_webgl.dropData(this.spriter_data, this.atlas_data);
    delete this.render_webgl;
  } else if (game.renderer instanceof PIXI.CanvasRenderer) {
    this.render_ctx2d.dropData(this.spriter_data, this.atlas_data);
    delete this.render_ctx2d;
  } else {
    console.log("TODO");
  }
  delete this.spriter_data;
  delete this.spriter_pose;
  delete this.images;
  Phaser.Group.prototype.destroy.call(this, game);
}
Phaser.Plugin.Spriter.SpriterObject.prototype.update = function() {
  Phaser.Group.prototype.update.call(this);
  var dt = this.game.time.physicsElapsedMS;
  this.spriter_pose.update(dt);
}
Phaser.Plugin.Spriter.SpriterObject.prototype._renderWebGL = function(renderSession) {
  //console.log("_renderWebGL", arguments);
  var gl /*: WenGLRenderingContext*/ = renderSession.gl;
  this.spriter_pose.strike();
  var gl_projection = this.render_webgl.gl_projection;
  var px = renderSession.renderer.projection.x;
  var py = renderSession.renderer.projection.y;
  mat4x4Ortho(gl_projection, -px, px, -py, py, -1, 1);
  mat4x4Translate(gl_projection, this.worldPosition.x, this.worldPosition.y, 0.0);
  mat4x4RotateZ(gl_projection, this.worldRotation);
  mat4x4Scale(gl_projection, this.worldScale.x, this.worldScale.y, 1.0);
  mat4x4Scale(gl_projection, 1.0, -1.0, 1.0); // x: right, y: up
  var gl_color = this.render_webgl.gl_color;
  gl_color[3] = this.worldAlpha;
  this.render_webgl.drawPose(this.spriter_pose, this.atlas_data);
};
Phaser.Plugin.Spriter.SpriterObject.prototype._renderCanvas = function(renderSession) {
  //console.log("_renderCanvas", arguments);
  var ctx /*: CanvasRenderingContext2D*/ = renderSession.context;
  this.spriter_pose.strike();
  ctx.save();
  ctx.translate(this.worldPosition.x, this.worldPosition.y);
  ctx.rotate(this.worldRotation);
  ctx.scale(this.worldScale.x, this.worldScale.y);
  ctx.scale(1.0, -1.0); // x: right, y: up
  ctx.globalAlpha = this.worldAlpha;
  this.render_ctx2d.drawPose(this.spriter_pose, this.atlas_data);
  ctx.restore();
};

Phaser.GameObjectCreator.prototype.spriter = function(options) {
  return new Phaser.Plugin.Spriter.SpriterObject(this.game, options);
};

Phaser.GameObjectFactory.prototype.spriter = function(options) {
  return this.world.add(new Phaser.Plugin.Spriter.SpriterObject(this.game, options));
};
