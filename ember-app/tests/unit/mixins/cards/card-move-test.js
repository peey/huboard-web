import Ember from 'ember';
import CardMoveMixin from 'app/mixins/cards/card-move';

import {
  moduleFor,
  test
} from 'ember-qunit';

var sut;

function createIssueData(){
  return Ember.Object.create({
    _data: { order: 2.5 },
    data: Ember.Object.create({ id: 123, title: 'test' })
  });
}

function minMaxZeroOrderFixAlgorithm(issue){
  var order = issue._data.order;
  while(order < 1e-319){ order *= 10; }
  while(order > 1e307){ order /= 10; }

  return order;
}

moduleFor('mixin:cards/card-move', 'CardMoveMixin', {
  setup: function(){
    sut = Ember.Object.
      createWithMixins(CardMoveMixin, {});
  }
});

test('move the issue to the top', function(assert){
  var cardMover = sut.cardMover;
  cardMover.set('orderKey', 'order');

  //Moves issue to the top
  var issueBelow = createIssueData();
  var result = cardMover.moveToTop(issueBelow);
  assert.ok(result < issueBelow._data.order, 'The new order is less than the issue below');

  //Moves issue to the top when order has been adjusted for MIN_VALUE
  issueBelow = createIssueData();
  issueBelow._data.order = 5e-324;
  issueBelow._data.order = minMaxZeroOrderFixAlgorithm(issueBelow);

  result = cardMover.moveToTop(issueBelow);
  assert.ok(result < issueBelow._data.order, 'The new order is less than the issue below');

  //If issue move is impossible give it a value below the minThreshold
  issueBelow = createIssueData();
  issueBelow._data.order = 1e-323;

  result = cardMover.moveToTop(issueBelow);
  assert.ok(result > cardMover.minThreshold, 'The new order is less than the issue below');
});

test('move the issue to the bottom', function(assert){
  var cardMover = sut.cardMover;
  cardMover.set('orderKey', 'order');

  //Moves issue to the bottom 
  var issueAbove = createIssueData();
  var result = cardMover.moveToBottom(issueAbove);
  assert.ok(result > issueAbove._data.order, 'The new order is greater than the issue above');

  //Moves issue to the bottom when order has been adjusted for MAX_VALUE
  issueAbove = createIssueData();
  issueAbove._data.order = Number.MAX_VALUE;
  issueAbove._data.order = minMaxZeroOrderFixAlgorithm(issueAbove);

  result = cardMover.moveToBottom(issueAbove);
  assert.ok(result > issueAbove._data.order, 'The adjusted order is greater than the issue below');

  //If issue move is impossible give it a value above the maxThreshold
  issueAbove = createIssueData();
  issueAbove._data.order = 1.797692738796007e+308;

  result = cardMover.moveToTop(issueAbove);
  assert.ok(result > cardMover.minThreshold, 'The new order is less than the issue below');
});
