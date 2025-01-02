/**
 * Represents a post with comments, likes, and timestamps.
 */
export interface Post {
  /**
   * Unique identifier for the post.
   */
  id: string;

  /**
   * Author of the post.
   */
  author: string;

  /**
   * Title of the post.
   */
  title: string;

  /**
   * Content of the post.
   */
  content: string;

  /**
   * Channels where the post is shared.
   */
  channels: string[];

  /**
   * Number of likes the post has received.
   */
  likes: number;

  /**
   * Number of dislikes the post has received.
   */
  dislikes: number;

  /**
   * Timestamps related to the post.
   */
  times: {
    /**
     * Timestamp of when the post was created.
     */
    created: number;
  };

  /**
   * Comments on the post.
   */
  comments: Array<{
    /**
     * Content of the comment.
     */
    comment: string;

    /**
     * Author of the comment.
     */
    author: string;

    /**
     * Timestamp of when the comment was made.
     */
    time: number;

    /**
     * Number of likes the comment has received.
     */
    likes: number;

    /**
     * Number of dislikes the comment has received.
     */
    dislikes: number;
  }>;
}