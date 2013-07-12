/**
 * Copyright 2013 Google, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview Step. Represents the flow either between 2 frames or within a
 *     frame.
 *
 * @author chizeng@google.com (Chi Zeng)
 */

goog.provide('wtf.replay.graphics.Step');

goog.require('wtf.db.EventIterator');



/**
 * Encapsulates events between 2 frames or within a frame.
 *
 * @param {!wtf.db.EventList} eventList Event list for an entire animation.
 * @param {number} startEventId Start event ID.
 * @param {number} endEventId End event ID.
 * @param {wtf.db.Frame=} opt_frame Frame this step draws if and only if the
 *     step draws one.
 * @param {Object.<boolean>=} opt_contexts The set of contexts that exist at
 *     the start of this step.
 * @constructor
 */
wtf.replay.graphics.Step = function(
    eventList, startEventId, endEventId, opt_frame, opt_contexts) {

  /**
   * List of events for entire animation.
   * @type {!wtf.db.EventList}
   * @private
   */
  this.eventList_ = eventList;

  /**
   * Start event ID.
   * @type {number}
   * @private
   */
  this.startEventId_ = startEventId;

  /**
   * End event ID.
   * @type {number}
   * @private
   */
  this.endEventId_ = endEventId;

  /**
   * A list of indices of visible events. Used for listing events that are
   * hidden, but should be displayed since they relate to WebGL.
   * @type {!Array.<number>}
   * @private
   */
  this.visibleEvents_ = this.createVisibleEventsList_();

  /**
   * Either the frame this step draws or null if this step is not responsible
   *     for drawing a frame.
   * @type {wtf.db.Frame}
   * @private
   */
  this.frame_ = opt_frame || null;

  /**
   * The set of contexts that exist at the start of this step.
   * @type {!Object.<boolean>}
   * @private
   */
  this.initialContexts_ = opt_contexts || {};
};


/**
 * Creates an event iterator that spans the events for the step.
 * @param {boolean=} opt_visible True if only visible events should be included
 *     in the iteration. False by default.
 * @return {!wtf.db.EventIterator} The created event iterator.
 */
wtf.replay.graphics.Step.prototype.getEventIterator = function(opt_visible) {
  if (opt_visible) {
    var indirectionTable = this.visibleEvents_;
    return new wtf.db.EventIterator(
        this.eventList_, 0, indirectionTable.length - 1, 0, indirectionTable);
  }
  return this.eventList_.beginEventRange(
      this.startEventId_, this.endEventId_);
};


/**
 * Returns the frame this step draws if the step draws one.
 * @return {wtf.db.Frame} The frame.
 */
wtf.replay.graphics.Step.prototype.getFrame = function() {
  return this.frame_;
};


/**
 * Gets the ID of the begin event.
 * @return {number} ID of the begin event.
 */
wtf.replay.graphics.Step.prototype.getStartEventId = function() {
  return this.startEventId_;
};


/**
 * Gets the ID of the end event.
 * @return {number} ID of the end event.
 */
wtf.replay.graphics.Step.prototype.getEndEventId = function() {
  return this.endEventId_;
};


/**
 * Gets a list of indices of visible events.
 * @return {!Array.<number>} A list of indices of visible events.
 * @private
 */
wtf.replay.graphics.Step.prototype.createVisibleEventsList_ = function() {
  // Make hidden events that either create or set contexts visible.
  var createContextId = this.eventList_.getEventTypeId(
      'wtf.webgl#createContext');
  var setContextId = this.eventList_.getEventTypeId('wtf.webgl#setContext');
  var visibleTypeIds = {};
  visibleTypeIds[createContextId] = true;
  visibleTypeIds[setContextId] = true;

  // Filter for only non-hidden events.
  var visibleEvents = [];
  for (var it = this.getEventIterator(); !it.done(); it.next()) {
    if (!it.isHidden() || visibleTypeIds[it.getTypeId()]) {
      visibleEvents.push(it.getIndex());
    }
  }

  return visibleEvents;
};


/**
 * Returns the set of handles of contexts that exist at the start of the step.
 * @return {!Object.<boolean>} The set of handles of initial contexts.
 */
wtf.replay.graphics.Step.prototype.getInitialContexts = function() {
  return this.initialContexts_;
};
